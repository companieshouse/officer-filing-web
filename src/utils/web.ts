import { Request } from "express";
import { urlUtils } from "./url";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH } from "../types/page.urls";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
/**
 * Get field from the form. If the field is populated then it will be returned, else undefined.
 */
export const getField = (req: Request, fieldName: string): string => {
  const field: string = req.body[fieldName];
  if (field && field.trim().length > 0) {
    return field;
  }
  return "";
};


/**
 * Set the back link for a page. 
 * Checks whether the user came from the check your answers page and if so,
 *  sets the back link to the check your answers page instead.
 */
export const setBackLink = (req: Request, checkYourAnswersLink: string | undefined, backLink: string): string => {
  if(checkYourAnswersLink){
    return checkYourAnswersLink;
  }
  return backLink;
};

/**
 * Set the redirect link for a page. 
 * Checks whether the user came from the check your answers page and if so,
 *  sets the redirect link to the check your answers page instead.
 */
export const setRedirectLink = async (req: Request, checkYourAnswersLink: string | undefined, backLink: string): Promise<string> => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session: Session = req.session as Session;
  if(checkYourAnswersLink){
    const officerFiling: OfficerFiling = {
      checkYourAnswersLink: ""
  };
  await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
  return urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req);
  }
  return backLink;
}