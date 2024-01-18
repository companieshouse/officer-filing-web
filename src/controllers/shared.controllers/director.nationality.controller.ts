import { NextFunction, Request, Response } from "express"
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";

import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { getField, setBackLink, setRedirectLink } from "../../utils/web";
import { NATIONALITY_LIST } from "../../utils/properties";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { DirectorField } from "../../model/director.model";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { BASIC_STOP_PAGE_PATH, DIRECTOR_NATIONALITY_PATH, UPDATE_DIRECTOR_NATIONALITY_PATH, URL_QUERY_PARAM } from "../../types/page.urls";
import { STOP_TYPE } from "../../utils/constants";
import { urlUtils } from "../../utils/url";
import { getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";

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
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      nationality2_hidden: officerFiling.nationality2Link,
      nationality3_hidden: officerFiling.nationality3Link,
      isUpdate,
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
    const nextPage = urlUtils.getUrlToPath(nextPageUrl, req);
    return res.redirect(await setRedirectLink(req, patchedFiling.data.checkYourAnswersLink, nextPage));
  } catch (e) {
    return next(e);
  }
};

const sameNationalityWithChips = (currentOfficerFiling: OfficerFiling, companyAppointment: CompanyAppointment): boolean => {
  const nationality = companyAppointment.nationality?.split(",")!;
  let sameNationality: boolean = false;
  if (currentOfficerFiling.nationality1 === nationality[0]) {
    if (!(((currentOfficerFiling.nationality2) && (nationality[1] !== currentOfficerFiling.nationality2)) 
        || ((currentOfficerFiling.nationality3) &&(nationality[2] !== currentOfficerFiling.nationality3)))) 
        {
          sameNationality = true;
    } 
  } 
  return sameNationality;
}