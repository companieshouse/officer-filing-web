import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { ACTIVE_DIRECTORS_DETAILS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_NAME_PATH, 
        DIRECTOR_NATIONALITY_PATH, DIRECTOR_OCCUPATION_PATH } from "../../types/page.urls";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    return resp.render(Templates.UPDATE_DIRECTOR_DETAILS, {
      templateName: Templates.UPDATE_DIRECTOR_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(ACTIVE_DIRECTORS_DETAILS_PATH, req),
      cancelLink:  urlUtils.getUrlToPath(ACTIVE_DIRECTORS_DETAILS_PATH, req),
      ...officerFiling,
      ...companyProfile,
      nameLink: urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req),
      nationalityLink: urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req),
      occupationLink: urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req),
      correspondenceAddressChangeLink: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
    })
  } catch(e) {
    return next(e);
  }
};

export const post = (req: Request, resp: Response, next: NextFunction) => {
  return resp.redirect(urlUtils.getUrlToPath("", req));
}