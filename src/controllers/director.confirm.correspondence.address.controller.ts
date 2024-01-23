import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH_END,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    
    return res.render(Templates.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, {
      templateName: Templates.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req),
      ...officerFiling.serviceAddress
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  return res.redirect(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req));
};
