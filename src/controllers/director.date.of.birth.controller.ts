import { NextFunction, Request, Response } from "express";
import { DIRECTOR_APPOINTED_DATE_PATH, DIRECTOR_NAME_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { ValidationError } from "../model/validation.model";
import { OfficerFiling, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { dobDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { DobDateField } from "../model/date.model";
import { validateDate } from "../validation/date.validation";
import { DobDateValidation } from "../validation/dob.date.validation.config";
import { getValidationStatus } from "../services/validation.status.service";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    return res.render(Templates.DIRECTOR_DATE_OF_BIRTH, {
      templateName: Templates.DIRECTOR_DATE_OF_BIRTH,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req),
      // TODO: Pre-render fields from officerFiling object
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session: Session = req.session as Session;

  // Get date of birth
  const day = req.body[DobDateField.DAY];
  const month = req.body[DobDateField.MONTH];
  const year = req.body[DobDateField.YEAR];
  const dateOfBirth = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');   // Get date in the format yyyy-mm-dd

  // Validate the date fields (JS)
  const dateValidationResult = validateDate(day, month, year, DobDateValidation);
  if (dateValidationResult) {
    return res.render(Templates.DIRECTOR_NAME, {
      templateName: Templates.DIRECTOR_DATE_OF_BIRTH,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req),
      errors: formatValidationErrors([dateValidationResult]),
      // TODO: Render field values
    });
  }

  // Get validation status and check for errors
  const validationStatus = await getValidationStatus(session, transactionId, submissionId);
  const validationErrors = buildValidationErrors(validationStatus);
  if (validationErrors.length > 0) {
    return res.render(Templates.DIRECTOR_NAME, {
      templateName: Templates.DIRECTOR_DATE_OF_BIRTH,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req),
      errors: formatValidationErrors(validationErrors),
      // TODO: Render field values
    });
  }

  // TODO: Patch filing
  const officerFiling: OfficerFiling = {
    dateOfBirth: dateOfBirth  // TODO: Update sdk model object to include date of birth string
  };
  await patchOfficerFiling(session, transactionId, submissionId, officerFiling);

  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_APPOINTED_DATE_PATH, req);
  return res.redirect(nextPageUrl);
};

/**
 * Build a list of error objects that will be displayed on the page, based on the result from getValidation.
 * Only certain relevant errors to do with the elements on the page will be returned, others will be ignored.
 * 
 * @param validationStatusResponse Response from running getValidation. Contains the api validation messages
 * @returns A list of ValidationError objects that contain the messages and info to display on the page
 */
export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  // Day/Month/Year API Validation
  var dobMissingDayKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, dobDateErrorMessageKey);
  if (dobMissingDayKey) {
    const validationError: ValidationError = {
      messageKey: dobMissingDayKey,
      source: [DobDateField.DAY, DobDateField.MONTH, DobDateField.YEAR],
      link: DobDateField.DAY
    };
    validationErrors.push(validationError);
  }

  return validationErrors;
}