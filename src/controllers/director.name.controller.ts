import { NextFunction, Request, Response } from "express";
import { CURRENT_DIRECTORS_PATH, DIRECTOR_DATE_OF_BIRTH_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { OfficerFiling, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { firstNameErrorMessageKey, formerNamesErrorMessageKey, lastNameErrorMessageKey, middleNameErrorMessageKey, titleErrorMessageKey } from "../utils/api.enumerations.keys";
import { getValidationStatus } from "../services/validation.status.service";
import { ValidationError } from "../model/validation.model";
import { DirectorField } from "../model/director.model";
import { createValidationError, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { TITLE_LIST } from "../utils/properties";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    return res.render(Templates.DIRECTOR_NAME, {
      templateName: Templates.DIRECTOR_NAME,
      backLinkUrl: urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
      personal_title: officerFiling.title,
      first_name: officerFiling.firstName,
      middle_names: officerFiling.middleNames,
      last_name: officerFiling.lastName,
      previous_names: officerFiling.formerNames,
      titles: TITLE_LIST
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
    const officerFiling: OfficerFiling = {
      title: getField(req, DirectorField.TITLE),
      firstName: getField(req, DirectorField.FIRST_NAME),
      middleNames: getField(req, DirectorField.MIDDLE_NAMES),
      lastName: getField(req, DirectorField.LAST_NAME),
      formerNames: getField(req, DirectorField.FORMER_NAMES),
    };
    console.info("officerFiling = ");   // TODO: Remove
    console.info(officerFiling);        // TODO: Remove
    await patchOfficerFiling(session, transactionId, submissionId, officerFiling);

    // Validate the filing (API)
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    const validationErrors = buildValidationErrors(validationStatus);
    const errors = formatValidationErrors(validationErrors);
    console.info("errors = ");  // TODO: Remove
    console.info(errors);
    if (validationErrors.length > 0) {
      return res.render(Templates.DIRECTOR_NAME, {
        templateName: Templates.DIRECTOR_NAME,
        backLinkUrl: urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
        errors: errors,
        titles: TITLE_LIST,
        personal_title: officerFiling.title,
        first_name: officerFiling.firstName,
        middle_names: officerFiling.middleNames,
        last_name: officerFiling.lastName,
        previous_names: officerFiling.formerNames
      });
    }

    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_DATE_OF_BIRTH_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

const getField = (req: Request, fieldName: string): string|undefined => {
  const field: string = req.body[fieldName];
  if (field && field.trim().length > 0) {
    return field;
  }
  return undefined;
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

  // Title
  var errorMessageKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, titleErrorMessageKey);
  if (errorMessageKey) {
    validationErrors.push(createValidationError(errorMessageKey, DirectorField.TITLE));
  }

  // First name
  var errorMessageKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, firstNameErrorMessageKey);
  if (errorMessageKey) {
    validationErrors.push(createValidationError(errorMessageKey, DirectorField.FIRST_NAME));
  }

  // Middle names
  var errorMessageKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, middleNameErrorMessageKey);
  if (errorMessageKey) {
    validationErrors.push(createValidationError(errorMessageKey, DirectorField.MIDDLE_NAMES));
  }

  // Last name
  var errorMessageKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, lastNameErrorMessageKey);
  if (errorMessageKey) {
    validationErrors.push(createValidationError(errorMessageKey, DirectorField.LAST_NAME));
  }

  // Former names
  var errorMessageKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, formerNamesErrorMessageKey);
  if (errorMessageKey) {
    validationErrors.push(createValidationError(errorMessageKey, DirectorField.FORMER_NAMES));
  }

  return validationErrors;
}
