import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { getBackLinkUrl } from '../director.residential.address.controller';
import { Session } from "@companieshouse/node-session-handler";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  console.log(`########## get update`)
  try {
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    return resp.render(Templates.UPDATE_DIRECTOR_DETAILS, {
      templateName: Templates.UPDATE_DIRECTOR_DETAILS,
      backLinkUrl: "/",
      ...officerFiling,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    })
  }catch(e) {
    return next(e);
  }
};

export const post = (req: Request, response: Response, next: NextFunction) => {

}