import { NextFunction, Request, Response } from "express";
import { DIRECTOR_APPOINTED_DATE_PATH, DIRECTOR_NAME_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { ValidationError } from "../model/validation.model";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { createValidationError, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { dobDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { DobDateField } from "../model/date.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_DATE_OF_BIRTH, {
      templateName: Templates.DIRECTOR_DATE_OF_BIRTH,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_APPOINTED_DATE_PATH, req);
  return res.redirect(nextPageUrl);
};

/**
 * Build a list of error objects that will be displayed on the page, based on the result from getValidation.
 * Only certain relevant errors to do with the elements on the page will be returned, others will be ignored.
 * There is some more complex logic around previous names with some JS validation
 * 
 * @param validationStatusResponse Response from running getValidation. Contains the api validation messages
 * @returns A list of ValidationError objects that contain the messages and info to display on the page
 */
export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  // missing day
  var dobMissingDayKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, dobDateErrorMessageKey.MISSING_DAY);
  if (dobMissingDayKey) {
    validationErrors.push(createValidationError(dobMissingDayKey, DobDateField.DAY));
  }

  //


  return validationErrors;
}