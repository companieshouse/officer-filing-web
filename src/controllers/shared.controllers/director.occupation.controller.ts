import { NextFunction, Request, Response } from "express";
import { BASIC_STOP_PAGE_PATH, DIRECTOR_NATIONALITY_PATH, DIRECTOR_OCCUPATION_PATH, UPDATE_DIRECTOR_OCCUPATION_PATH, UPDATE_DIRECTOR_DETAILS_PATH, URL_QUERY_PARAM } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { OCCUPATION_LIST } from "../../utils/properties";
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../../model/director.model";
import { getDirectorNameForAppointJourney, getField, getDirectorNameForUpdateJourney, setBackLink, setRedirectLink } from "../../utils/web";
import { logger } from "../../utils/logger";
import { ValidationError } from "../../model/validation.model";
import { formatSentenceCase, formatTitleCase } from "../../utils/format";
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
import { selectLang, getLocalesService, getLocaleInfo, addLangToUrl } from '../../utils/localise';


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
      currentUrl : isUpdate ? getUpdateUrl(req, lang) : getAppointUrl(req, lang),
      backLinkUrl: addLangToUrl(setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(backUrlPath, req)), lang),
      optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
      typeahead_array: OCCUPATION_LIST,
      typeahead_value: formatSentenceCase(officerFiling.occupation),
      directorName: isUpdate ? 
        formatTitleCase(await getDirectorNameForUpdateJourney(session, req, officerFiling)): 
        formatTitleCase(await getDirectorNameForAppointJourney(officerFiling)),
      occupationField: DirectorField.OCCUPATION, // pass enum value to template
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
  const lang = selectLang(req.query.lang);

  const occupation = getField(req, DirectorField.OCCUPATION);
  const frontendValidationErrors = validateOccupation(occupation, OccupationValidation);

  // render validation errors
  if(frontendValidationErrors) {
    const currentUrl = isUpdate ? getUpdateUrl(req, lang) : getAppointUrl(req, lang)
    return renderPage(res, req, officerFiling, [frontendValidationErrors], occupation, currentUrl);
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
        urlUtils.setQueryParam(addLangToUrl(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), lang), 
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

  const nextPage = addLangToUrl(urlUtils.getUrlToPath(nextPageUrl, req), lang);
  return res.redirect(await setRedirectLink(req, patchedFiling.data.checkYourAnswersLink, nextPage, lang));
  } catch (e) {
    return next(e);
  }
};

export const renderPage = async (res: Response, req: Request, officerFiling: OfficerFiling, validationErrors: ValidationError[], occupation: string, currentUrl: string, isUpdate?: boolean) => {
  const lang = selectLang(req.query.lang);
  const formattedErrors = formatValidationErrors(validationErrors, lang);
  const locales = getLocalesService();
  const session: Session = req.session as Session;

  const isUpdateJourney = req.path.includes("update-director-occupation");

  let backLinkUrl: string;
  if (isUpdateJourney){
    backLinkUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req)
  } else {
    backLinkUrl = urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req)
  }

  return res.render(Templates.DIRECTOR_OCCUPATION, {
    templateName: Templates.DIRECTOR_OCCUPATION,
    ...getLocaleInfo(locales, lang),
    currentUrl: currentUrl,
    backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink, backLinkUrl, lang),
    typeahead_array: OCCUPATION_LIST,
    typeahead_value: formatSentenceCase(occupation),
    errors: formattedErrors,
    typeahead_errors: JSON.stringify(formattedErrors),
    directorName: isUpdate ?  
      formatTitleCase(await getDirectorNameForUpdateJourney(session, req, officerFiling)) :    
      formatTitleCase(await getDirectorNameForAppointJourney(officerFiling)),
  });
}

const getAppointUrl = (req: Request, lang: string): string => {
    return addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req), lang)
}

const getUpdateUrl = (req: Request, lang: string): string => {
  return addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_OCCUPATION_PATH, req), lang);
};

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
  let occupationKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, occupationErrorMessageKey);
  if (occupationKey) {
    validationErrors.push(createValidationErrorBasic(occupationKey, DirectorField.OCCUPATION));
  }

  return validationErrors;
}