import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
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
    let returnPageUrl = officerFiling.residentialAddressBackLink;
    if (returnPageUrl?.includes(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END)) {
      returnPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req);
    } else if (returnPageUrl?.includes(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END)) {
      returnPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, req);
    } else if (returnPageUrl?.includes(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END)){
      returnPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req);
    } else {
      //edge case should not happen
      // returnPageUrl = req.headers.referer!
      returnPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, req);
    }
    return res.render(Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, {
      templateName: Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS,
      backLinkUrl: returnPageUrl,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
      ...officerFiling.residentialAddress
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req);
  return res.redirect(nextPageUrl);
};
