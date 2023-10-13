import { NextFunction, Request, Response } from "express";
import { DIRECTOR_PROTECTED_DETAILS_PATH, APPOINT_DIRECTOR_SUBMITTED_PATH, CURRENT_DIRECTORS_PATH, URL_QUERY_PARAM, BASIC_STOP_PAGE_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { toReadableFormat } from "../utils/date";
import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { STOP_TYPE } from "../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session: Session = req.session as Session;
  const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
  const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
  try {
    return res.render(Templates.APPOINT_DIRECTOR_CHECK_ANSWERS, {
      templateName: Templates.APPOINT_DIRECTOR_CHECK_ANSWERS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req),
      cancelLink:  urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
      company: companyProfile,
      officerFiling: officerFiling,
      name: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      dateOfBirth: toReadableFormat(officerFiling.dateOfBirth),
      appointedOn: toReadableFormat(officerFiling.appointedOn)
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
  const session: Session = req.session as Session;
  var nextPageUrl = urlUtils.getUrlToPath(APPOINT_DIRECTOR_SUBMITTED_PATH, req);
  
  if (await getCurrentOrFutureDissolved(session, companyNumber)){
    nextPageUrl = urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req);
    nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED);
  }


  return res.redirect(nextPageUrl);
};
