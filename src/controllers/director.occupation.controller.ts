import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_NATIONALITY_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { TITLE_LIST } from "../utils/properties";
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../model/director.model";
import { getField } from "../utils/web";
import { logger } from "../utils/logger";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(Templates.DIRECTOR_OCCUPATION, {
      templateName: Templates.DIRECTOR_OCCUPATION,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req),
      typeahead_array: TITLE_LIST,
      typeahead_value: officerFiling.occupation
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
  logger.debug(`Patching officer filing with occupation ` + getField(req, DirectorField.OCCUPATION));
  const officerFiling: OfficerFiling = {
    occupation: getField(req, DirectorField.OCCUPATION)
  };
  await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req);
  return res.redirect(nextPageUrl);
} catch (e) {
  return next(e);
}
};
