import { NextFunction, Request, Response } from "express";
import { UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, UPDATE_DIRECTOR_DETAILS_PATH, } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    return resp.render(Templates.DIRECTOR_DATE_OF_CHANGE, {
      templateName: Templates.DIRECTOR_DATE_OF_CHANGE,
      backLinkUrl: urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      ...officerFiling,
      ...companyProfile,
    })
  } catch(e) {
    return next(e);
  }
};

export const post = (req: Request, resp: Response, next: NextFunction) => {
  return resp.redirect(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, req));
}
