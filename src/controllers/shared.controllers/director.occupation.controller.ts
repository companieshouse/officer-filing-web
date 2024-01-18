import { NextFunction, Request, Response } from "express";
import { BASIC_STOP_PAGE_PATH, DIRECTOR_NATIONALITY_PATH, DIRECTOR_OCCUPATION_PATH, UPDATE_DIRECTOR_OCCUPATION_PATH, URL_QUERY_PARAM } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { OCCUPATION_LIST } from "../../utils/properties";
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../../model/director.model";
import { getField, setBackLink, setRedirectLink } from "../../utils/web";
import { logger } from "../../utils/logger";
import { ValidationError } from "../../model/validation.model";
import { formatSentenceCase, formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { validateOccupation } from "../../validation/occupation.validation";
import { OccupationValidation } from "../../validation/occupation.validation.config";
import {
  createValidationErrorBasic,
  formatValidationErrors,
  mapValidationResponseToAllowedErrorKey
} from "../../validation/validation";
import { occupationErrorMessageKey } from "../../utils/api.enumerations.keys";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { STOP_TYPE } from "../../utils/constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../utils/localise";


export const getDirectorOccupation = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    return res.render(templateName, {
      templateName: templateName,
      ...getLocaleInfo(locales, lang),
      currentUrl: getCurrentUrl(req, isUpdate),
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(backUrlPath, req)),
      optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
      typeahead_array: OCCUPATION_LIST,
      typeahead_value: formatSentenceCase(officerFiling.occupation),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling))
    });
  } catch (e) {
    return next(e);
  }
};

export const postDirectorOccupation = async (req: Request, res: Response, next: NextFunction, nextPageUrl: string, isUpdate: boolean) => {
  try {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session: Session = req.session as Session;
  const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

  const occupation = getField(req, DirectorField.OCCUPATION);
  const frontendValidationErrors = validateOccupation(occupation, OccupationValidation);

  // render validation errors
  if(frontendValidationErrors) {
    return renderPage(res, req, officerFiling, [frontendValidationErrors], occupation, getCurrentUrl(req, isUpdate));
  }

  // patch the filing with occupation when no front end validation errors encountered.
  logger.debug(`Patching officer filing with occupation ` + occupation);
  const patchedOccupationFiling: OfficerFiling = {
    occupation: occupation
  };

  if (isUpdate) {
    const appointmentId = officerFiling.referenceAppointmentId as string;
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    if (officerFiling.referenceEtag !== companyAppointment.etag) {
      return res.redirect(
        urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), 
        URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.ETAG));
    }

    if ((companyAppointment.occupation?.toLowerCase() === patchedOccupationFiling.occupation?.toLowerCase())
      || (companyAppointment.occupation === "None" && patchedOccupationFiling.occupation === "")) {
      patchedOccupationFiling.occupationHasBeenUpdated = false;
    }
    else{
      patchedOccupationFiling.occupationHasBeenUpdated = true;
    }
  }
  const patchedFiling = await patchOfficerFiling(session, transactionId, submissionId, patchedOccupationFiling);

  const nextPage = urlUtils.getUrlToPath(nextPageUrl, req);
  return res.redirect(await setRedirectLink(req, patchedFiling.data.checkYourAnswersLink, nextPage));
  } catch (e) {
    return next(e);
  }
};

export const renderPage = (res: Response, req: Request, officerFiling: OfficerFiling, validationErrors: ValidationError[], occupation: string, currentUrl: string) => {
  const lang = selectLang(req.query.lang);
  const formattedErrors = formatValidationErrors(validationErrors, lang);
  const locales = getLocalesService();
  return res.render(Templates.DIRECTOR_OCCUPATION, {
    templateName: Templates.DIRECTOR_OCCUPATION,
    ...getLocaleInfo(locales, lang),
    currentUrl: currentUrl,
    backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req)),
    typeahead_array: OCCUPATION_LIST,
    typeahead_value: formatSentenceCase(occupation),
    errors: formattedErrors,
    typeahead_errors: JSON.stringify(formattedErrors),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling))
  });
}

/**
 * Determine the URL of the page based on whether it is part of the AP01 or CH01 flow.
 * @param req 
 * @param isUpdate 
 * @returns 
 */
const getCurrentUrl = (req: Request, isUpdate: boolean) => {
  if(isUpdate){
    return urlUtils.getUrlToPath(UPDATE_DIRECTOR_OCCUPATION_PATH, req);
    }
    else{
    return urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req)
    }
}

/**
 * Build a list of error objects that will be displayed on the page, based on the result from getValidation.
 * Only certain relevant errors to do with the elements on the page will be returned, others will be ignored.
 * There is some more complex logic around previous names with some JS validation
 *
 * @param validationStatusResponse Response from running getValidation. Contains the api validation messages
 * @returns A list of ValidationError objects that contain the messages and info to display on the page
 */
export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  // Occupation
  var occupationKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, occupationErrorMessageKey);
  if (occupationKey) {
    validationErrors.push(createValidationErrorBasic(occupationKey, DirectorField.OCCUPATION));
  }

  return validationErrors;
}