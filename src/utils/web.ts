import { Request } from "express";
import { urlUtils } from "./url";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH } from "../types/page.urls";
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
export const setBackLink = (req: Request, checkYourAnswersBoolean: boolean, backLink: string): string => {
  if(checkYourAnswersBoolean){
    return urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req);
  }
  return backLink;
};