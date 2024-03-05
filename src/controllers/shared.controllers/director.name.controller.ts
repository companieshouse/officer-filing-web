import { NextFunction, Response, Request } from "express";
import { urlUtils } from '../../utils/url';
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { getField, setBackLink, setRedirectLink } from "../../utils/web";
import { TITLE_LIST } from "../../utils/properties";
import { DirectorField } from "../../model/director.model";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getLocaleInfo, getLocalesService, selectLang, addLangToUrl } from "../../utils/localise";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM, DIRECTOR_NAME_PATH, UPDATE_DIRECTOR_NAME_PATH, DIRECTOR_NAME_PATH_END } from "../../types/page.urls";
import { STOP_TYPE } from "../../utils/constants";
import { formatTitleCase, retrieveDirectorNameFromAppointment } from "../../utils/format";
import { FormattedValidationErrors } from "model/validation.model";
import { LocalesService } from "@companieshouse/ch-node-utils";

export const getDirectorName = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate?: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    let currentUrl;
    let directorName;
    if(isUpdate){
      const companyAppointment = await getCompanyAppointmentFullRecord(session, urlUtils.getCompanyNumberFromRequestParams(req), officerFiling.referenceAppointmentId as string);
      currentUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_NAME_PATH, req);
      directorName = retrieveDirectorNameFromAppointment(companyAppointment)
    } else {
      currentUrl = urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req)
    }
    const errors = res.getErrorMessage(DIRECTOR_NAME_PATH_END, req.headers.referer!, lang);
    const userData = res.getUserData(DIRECTOR_NAME_PATH_END, req.headers.referer!);
    if (userData && errors) {
      const bodyData = {
        typeahead_value: userData["typeahead_input_0"],
        first_name: userData["first_name"],
        middle_names: userData["middle_names"],
        last_name: userData["last_name"],
        previous_names: userData["previous_names"],
        previous_names_radio: calculatePreviousNamesRadioFromFiling(userData["previous_names_radio"]),
        directorName: userData["directorName"] ? formatTitleCase(userData["directorName"]) : formatTitleCase(directorName),
        isUpdate: isUpdate
      }
      return renderPage(req, res, templateName, bodyData, locales, backUrlPath, lang, currentUrl, officerFiling, errors);    
    } else {
      const offficerFilingData = {
        typeahead_value: officerFiling.title,
        first_name: officerFiling.firstName,
        middle_names: officerFiling.middleNames,
        last_name: officerFiling.lastName,
        previous_names: officerFiling.formerNames,
        previous_names_radio: calculatePreviousNamesRadioFromFiling(officerFiling.formerNames),
        directorName: formatTitleCase(directorName),
        isUpdate
      }
      return renderPage(req, res, templateName, offficerFilingData, locales, backUrlPath, lang, currentUrl, officerFiling);    
    }
  } catch(e) {
    return next(e)
  }
}

const renderPage = (req: Request, res: Response, templateName: string, userData: {}, locales: LocalesService, backUrlPath: string, lang: string, currentUrl: any, officerFiling: OfficerFiling, errors?: FormattedValidationErrors) => {
  return res.render(templateName, {
    ...getLocaleInfo(locales, lang),
    currentUrl: currentUrl,
    errors: errors,
    templateName: templateName,
    backLinkUrl: addLangToUrl(setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(backUrlPath, req)), lang),
    optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
    ...userData,
    typeahead_array: TITLE_LIST,
  });
}

export const postDirectorName = async (req: Request, res: Response, next: NextFunction, nextPageUrl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const lang = selectLang(req.query.lang);

    const officerFiling: OfficerFiling = {
      title: getField(req, DirectorField.TITLE)?.trim(),
      firstName: getField(req, DirectorField.FIRST_NAME)?.trim(),
      middleNames: getField(req, DirectorField.MIDDLE_NAMES)?.trim(),
      lastName: getField(req, DirectorField.LAST_NAME)?.trim(),
      formerNames: getPreviousNamesForFiling(req)?.trim()
    };

    if (isUpdate) {
      const currentOfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const appointmentId = currentOfficerFiling.referenceAppointmentId as string;
      const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

      if (currentOfficerFiling.referenceEtag !== companyAppointment.etag) {
        const stopPage = addLangToUrl(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), lang);
        return res.redirect(
          urlUtils.setQueryParam(stopPage, 
          URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.ETAG));
      }
      
      if (doFieldsMatch(companyAppointment.title, officerFiling.title) && doFieldsMatch(companyAppointment.forename, officerFiling.firstName) && doFieldsMatch(companyAppointment.otherForenames, officerFiling.middleNames) && doFieldsMatch(companyAppointment.surname, officerFiling.lastName)) {
        officerFiling.nameHasBeenUpdated = false;
      } else {
        officerFiling.nameHasBeenUpdated = true;
      }
    }

    const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFiling);

    const nextPage = addLangToUrl(urlUtils.getUrlToPath(nextPageUrl, req), lang);
    return res.redirect(await setRedirectLink(req, patchFiling.data.checkYourAnswersLink, nextPage, lang));

  } catch(e) {
    return next(e);
  }
}

/**
 * Calculate the state of the previous names radio buttons based on what is saved within former names in the filing
 * @returns The value to set for the radio button on the page
 */
const calculatePreviousNamesRadioFromFiling = (formerNames: string | undefined): string | undefined => {
  if (formerNames === null) {
    return undefined;
  }
  if (formerNames === "") {
    return DirectorField.NO;
  }
  return DirectorField.YES;
}

/**
 * Get previous names value to save on the filing. This value is dependent on the radio button choice.
 * @returns The string|undefined value to save on the filing
 */
const getPreviousNamesForFiling = (req: Request): string|undefined => {
  let previousNames = getField(req, DirectorField.PREVIOUS_NAMES);
  let previousNamesRadio = getField(req, DirectorField.PREVIOUS_NAMES_RADIO);

  if (previousNamesRadio == DirectorField.YES) {
    return previousNames;
  }
  if (previousNamesRadio == DirectorField.NO) {
    return "";
  }
}

/**
 * Compare two strings ignoring case. An empty string is treated the same as undefined.
 */
export const doFieldsMatch = (field1: string | undefined, field2: string | undefined): boolean => {
  if ((!field1 || field1.trim() == "") && (!field2 || field2.trim() == "")) {
    return true;
  }
  return field1?.toUpperCase() == field2?.toUpperCase();
}