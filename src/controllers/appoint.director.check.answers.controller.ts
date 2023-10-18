import { NextFunction, Request, Response } from "express";
import { DIRECTOR_PROTECTED_DETAILS_PATH, APPOINT_DIRECTOR_SUBMITTED_PATH, CURRENT_DIRECTORS_PATH, URL_QUERY_PARAM, BASIC_STOP_PAGE_PATH, DIRECTOR_NAME_PATH, DIRECTOR_DATE_OF_BIRTH, DIRECTOR_DATE_OF_BIRTH_PATH, DIRECTOR_APPOINTED_DATE_PATH, DIRECTOR_NATIONALITY_PATH, DIRECTOR_OCCUPATION_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { toReadableFormat } from "../utils/date";
import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { CONSENT_TO_ACT_AS_DIRECTOR, STOP_TYPE } from "../utils/constants";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getField } from "../utils/web";
import { DirectorField } from "../model/director.model";
import { FormattedValidationErrors } from "../model/validation.model";
import { createValidationErrorBasic, formatValidationErrors } from "../validation/validation";
import { logger } from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
  const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session: Session = req.session as Session;
  const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
  // Blank the back link rewrite to avoid it being used if a user clicks the back link from check your answers page
  const checkYourAnswersLinkPatch: OfficerFiling = {
      checkYourAnswersLink: ""
  };
  const officerFiling = await patchOfficerFiling(session, transactionId, submissionId, checkYourAnswersLinkPatch);
  
    renderPage(req, res, companyProfile, officerFiling.data, undefined);
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
  const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
  const session: Session = req.session as Session;
  var nextPageUrl = urlUtils.getUrlToPath(APPOINT_DIRECTOR_SUBMITTED_PATH, req);
  
  if (await getCurrentOrFutureDissolved(session, companyNumber)){
    nextPageUrl = urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req);
    nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED);
  }
  if (getField(req, DirectorField.DIRECTOR_CONSENT) !== DirectorField.DIRECTOR_CONSENT) {
    const consentError = createValidationErrorBasic(CONSENT_TO_ACT_AS_DIRECTOR, DirectorField.DIRECTOR_CONSENT);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return renderPage(req, res, companyProfile, officerFiling, formatValidationErrors([consentError]));
  }

  return res.redirect(nextPageUrl);
} catch (e) {
  return next(e);
}
};

const renderPage = (req: Request, res: Response, companyProfile: CompanyProfile, officerFiling: OfficerFiling, errors: FormattedValidationErrors | undefined) => {
  return res.render(Templates.APPOINT_DIRECTOR_CHECK_ANSWERS, {
    templateName: Templates.APPOINT_DIRECTOR_CHECK_ANSWERS,
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req),
    cancelLink:  urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
    company: companyProfile,
    officerFiling: officerFiling,
    name: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    formerNames:  formatTitleCase(officerFiling.formerNames),
    occupation:  formatTitleCase(officerFiling.occupation),
    dateOfBirth: toReadableFormat(officerFiling.dateOfBirth),
    appointedOn: toReadableFormat(officerFiling.appointedOn),
    nameLink: urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req),
    dateOfBirthLink: urlUtils.getUrlToPath(DIRECTOR_DATE_OF_BIRTH_PATH, req),
    dateAppointedLink: urlUtils.getUrlToPath(DIRECTOR_APPOINTED_DATE_PATH, req),
    nationalityLink: urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req),
    occupationLink: urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req),
    errors: errors
  });

}