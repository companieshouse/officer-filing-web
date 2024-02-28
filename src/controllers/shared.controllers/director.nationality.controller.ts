import { NextFunction, Request, Response } from "express"
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { getDirectorNameBasedOnJourney, getField, setBackLink, setRedirectLink } from "../../utils/web";
import { NATIONALITY_LIST } from "../../utils/properties";
import { formatTitleCase } from "../../utils/format";
import { DirectorField } from "../../model/director.model";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { BASIC_STOP_PAGE_PATH, DIRECTOR_NATIONALITY_PATH, UPDATE_DIRECTOR_NATIONALITY_PATH, URL_QUERY_PARAM } from "../../types/page.urls";
import { STOP_TYPE } from "../../utils/constants";
import { urlUtils } from "../../utils/url";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang} from "../../utils/localise";

export const getDirectorNationality = async (req: Request, res: Response, next: NextFunction, template: string, backUrlPath: string, isUpdate?: boolean) => {
  try {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    let currentUrl: string;

    if (isUpdate) {
      currentUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_NATIONALITY_PATH, req)
    } else {
      currentUrl = urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req)
    }

    return res.render(template, {
      templateName: template,
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(backUrlPath, req)),
      optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
      typeahead_array: NATIONALITY_LIST + "|" + NATIONALITY_LIST + "|" + NATIONALITY_LIST,
      typeahead_value: officerFiling.nationality1 + "|" + officerFiling.nationality2 + "|" + officerFiling.nationality3,
      directorName: formatTitleCase(await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling)),
      nationality2_hidden: checkNationality2(officerFiling),
      nationality3_hidden: checkNationality3(officerFiling),
      ...getLocaleInfo(locales, lang),
      currentUrl: currentUrl
    });
  } catch (e) {
    return next(e);
  }
};

export const postDirectorNationality = async (req: Request, res: Response, next: NextFunction, nextPageUrl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const lang = req.body.lang ? selectLang(req.body.lang) : selectLang(req.query.lang);

    const officerFiling: OfficerFiling = {
      nationality1: getField(req, DirectorField.NATIONALITY_1),
      nationality2: getField(req, DirectorField.NATIONALITY_2),
      nationality3: getField(req, DirectorField.NATIONALITY_3),
      nationality2Link: getField(req, DirectorField.NATIONALITY_2_RADIO),
      nationality3Link: getField(req, DirectorField.NATIONALITY_3_RADIO)
    };

    if (isUpdate) {
      const currentOfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const appointmentId = currentOfficerFiling.referenceAppointmentId as string;
      const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      if (currentOfficerFiling.referenceEtag !== companyAppointment.etag) {
        return res.redirect(
          urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), 
          URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.ETAG));
      }
      if(sameNationalityWithChips(officerFiling, companyAppointment)) {
        officerFiling.nationalityHasBeenUpdated = false;
      } else {
        officerFiling.nationalityHasBeenUpdated = true;
      }
    }

    const patchedFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
    const nextPage = addLangToUrl(urlUtils.getUrlToPath(nextPageUrl, req), lang);
    return res.redirect(await setRedirectLink(req, patchedFiling.data.checkYourAnswersLink, nextPage));
  } catch (e) {
    return next(e);
  }
};

const checkNationality3 = (officerFiling: OfficerFiling) => {
  if (officerFiling.nationality3) {
    return true;
  } else {
    return officerFiling.nationality3Link
  }
}

const checkNationality2 = (officerFiling: OfficerFiling) => {
  if (officerFiling.nationality2) {
    return true;
  } else {
    return officerFiling.nationality2Link
  }}

/**
 * Check if the officerFiling and companyAppointment contains identical nationalities.
 * @param currentOfficerFiling
 * @param companyAppointment
 * returns false if size of companyAppointment's nationalities is greater than currentOfficerFiling's nationalities, (which indicates that the one more nationality have been removed)
 * returns true if companyAppointment's nationalities are identical to currentOfficerFiling's nationalities, false otherwise.
 */

const sameNationalityWithChips = (currentOfficerFiling: OfficerFiling, companyAppointment: CompanyAppointment): boolean => {
  const chipsNationalities = companyAppointment.nationality?.split(",")!;
  let sameNationality: boolean = false;
  // Count the number of non-empty nationalities in currentOfficerFiling
   const officerFilingNationalitiesCount = ['nationality1', 'nationality2', 'nationality3']
   .reduce((count, nationalityKey) => currentOfficerFiling[nationalityKey] ? count + 1 : count, 0);

  // Check if companyAppointment has more nationalities than currentOfficerFiling
  if (chipsNationalities.length > officerFilingNationalitiesCount) {
    return sameNationality;
  }

  if (currentOfficerFiling.nationality1 === chipsNationalities[0]) {
    if (!(((currentOfficerFiling.nationality2) && (chipsNationalities[1] !== currentOfficerFiling.nationality2))
        || ((currentOfficerFiling.nationality3) &&(chipsNationalities[2] !== currentOfficerFiling.nationality3))))
        {
          sameNationality = true;
    } 
  } 
  return sameNationality;
}
