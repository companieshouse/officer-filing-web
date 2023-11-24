import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
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
      returnPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req);
    }
    return res.render(Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, {
      templateName: Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS,
      // backLinkUrl: returnPageUrl,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
      ...officerFiling.residentialAddress
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    // Patch filing with updated information
    const officerFilingBody: OfficerFiling = {
      protectedDetailsBackLink: DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END,
    };
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    if (officerFiling.checkYourAnswersLink) {
      return res.redirect(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req));
    }
    return res.redirect(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req));
  } catch (e) {
    return next(e);
  }
};