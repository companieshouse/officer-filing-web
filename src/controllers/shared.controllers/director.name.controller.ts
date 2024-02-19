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
import { BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM, DIRECTOR_NAME_PATH, UPDATE_DIRECTOR_NAME_PATH } from "../../types/page.urls";
import { STOP_TYPE } from "../../utils/constants";
import { formatTitleCase, retrieveDirectorNameFromAppointment } from "../../utils/format";

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

    return res.render(templateName, {
      ...getLocaleInfo(locales, lang),
      currentUrl: currentUrl,
      templateName: templateName,
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(backUrlPath, req)),
      optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
      typeahead_array: TITLE_LIST,
      typeahead_value: officerFiling.title,
      first_name: officerFiling.firstName,
      middle_names: officerFiling.middleNames,
      last_name: officerFiling.lastName,
      previous_names: officerFiling.formerNames,
      previous_names_radio: calculatePreviousNamesRadioFromFiling(officerFiling.formerNames),
      directorName: formatTitleCase(directorName),
      isUpdate
    });
  } catch(e) {
    return next(e)
  }
}

export const postDirectorName = async (req: Request, res: Response, next: NextFunction, nextPageUrl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

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
        const lang = selectLang(req.query.lang);
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

    const nextPage = urlUtils.getUrlToPath(nextPageUrl, req);
    return res.redirect(await setRedirectLink(req, patchFiling.data.checkYourAnswersLink, nextPage));

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