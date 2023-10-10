import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express"
import { getOfficerFiling } from "../services/officer.filing.service";
import { DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_SELECTION_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH } from '../types/page.urls';
import { Templates } from "../types/template.paths";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    resp.render(Templates.DIRECTOR_ADDRESS_RESIDENTIAL_ADDRESS_LIST, {
      templateName: Templates.DIRECTOR_ADDRESS_RESIDENTIAL_ADDRESS_LIST,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
    });
  } catch(error) {
    next(error);
  }
}

export const post = (req: Request, resp: Response, next: NextFunction) => {
  try {
    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_SELECTION_PATH, req);
    return resp.redirect(nextPageUrl);
  } catch(error) {
    next(error);
  }
}