import { Session } from "@companieshouse/node-session-handler"
import { NextFunction, Request, Response } from "express"
import { getOfficerFiling } from "../services/officer.filing.service"
import { DIRECTOR_ADDRESS_RESIDENTIAL_ADDRESS_LIST_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH } from "../types/page.urls"
import { Templates } from "../types/template.paths"
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format"
import { urlUtils } from "../utils/url"

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    console.log(`officer filing is ${JSON.stringify(officerFiling.residentialAddress)}`);
    res.render(Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_SELECTION_PATH, {
      templateName: Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_SELECTION_PATH,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_ADDRESS_RESIDENTIAL_ADDRESS_LIST_PATH, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
      ...officerFiling.residentialAddress
    })
  } catch(error) {
    next(error)
  };
}
export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {

  } catch(error) {
    next(error)
  };
}