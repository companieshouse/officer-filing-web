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
import { createValidationError, createValidationErrorBasic, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { TITLE_LIST } from "../utils/properties";
import { lookupWebValidationMessage } from "../utils/api.enumerations";
import { getField, setBackLink } from "../utils/web";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    // If we came from cya, patch the boolean in the filing
    
    
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    return res.render(Templates.DIRECTOR_NAME, {
      templateName: Templates.DIRECTOR_NAME,
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswers,urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req)),
      typeahead_array: TITLE_LIST,
      typeahead_value: officerFiling.title,
      first_name: officerFiling.firstName,
      middle_names: officerFiling.middleNames,
      last_name: officerFiling.lastName,
      previous_names: officerFiling.formerNames,
      previous_names_radio: calculatePreviousNamesRadioFromFiling(officerFiling.formerNames),
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
      formerNames: getPreviousNamesForFiling(req),
    };
    const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFiling);

    // Validate the filing
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    const validationErrors = buildValidationErrors(validationStatus, req.body[DirectorField.PREVIOUS_NAMES_RADIO], req.body[DirectorField.PREVIOUS_NAMES]);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_NAME, {
        templateName: Templates.DIRECTOR_NAME,
        backLinkUrl: setBackLink(req, patchFiling.checkYourAnswers,urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req)),
        errors: formattedErrors,
        typeahead_errors: JSON.stringify(formattedErrors),
        typeahead_array: TITLE_LIST,
        typeahead_value: officerFiling.title,
        first_name: officerFiling.firstName,
        middle_names: officerFiling.middleNames,
        last_name: officerFiling.lastName,
        previous_names: officerFiling.formerNames,
        previous_names_radio: getField(req, DirectorField.PREVIOUS_NAMES_RADIO),
      });
    }

    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_DATE_OF_BIRTH_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

/**
 * Calculate the state of the previous names radio buttons based on what is saved within former names in the filing
 * @returns The value to set for the radio button on the page
 */
const calculatePreviousNamesRadioFromFiling = (formerNames: string | undefined): string | undefined => {
  if (formerNames === null) {
    return undefined;
  }
  if (formerNames === "") {
    return DirectorField.NO;
  }
  return DirectorField.YES;
}

/**
 * Get previous names value to save on the filing. This value is dependent on the radio button choice.
 * @returns The string|undefined value to save on the filing
 */
const getPreviousNamesForFiling = (req: Request): string|undefined => {
  let previousNames = getField(req, DirectorField.PREVIOUS_NAMES);
  let previousNamesRadio = getField(req, DirectorField.PREVIOUS_NAMES_RADIO);

  if (!previousNamesRadio) {
    return undefined;
  } 
  if (previousNamesRadio == DirectorField.YES) {
    return previousNames;
  }
  if (previousNamesRadio == DirectorField.NO) {
    return "";
  }
  return undefined;
}

/**
 * Build a list of error objects that will be displayed on the page, based on the result from getValidation.
 * Only certain relevant errors to do with the elements on the page will be returned, others will be ignored.
 * There is some more complex logic around previous names with some JS validation
 * 
 * @param validationStatusResponse Response from running getValidation. Contains the api validation messages
 * @returns A list of ValidationError objects that contain the messages and info to display on the page
 */
export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse, previousNamesRadio: string, previousNames: string): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  // Title
  var titleKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, titleErrorMessageKey);
  if (titleKey) {
    validationErrors.push(createValidationErrorBasic(titleKey, DirectorField.TITLE));
  }

  // First name
  var firstNameKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, firstNameErrorMessageKey);
  if (firstNameKey) {
    validationErrors.push(createValidationErrorBasic(firstNameKey, DirectorField.FIRST_NAME));
  }

  // Middle names
  var middleNameKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, middleNameErrorMessageKey);
  if (middleNameKey) {
    validationErrors.push(createValidationErrorBasic(middleNameKey, DirectorField.MIDDLE_NAMES));
  }

  // Last name
  var lastNameKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, lastNameErrorMessageKey);
  if (lastNameKey) {
    validationErrors.push(createValidationErrorBasic(lastNameKey, DirectorField.LAST_NAME));
  }

  // Former names - includes JS validation around the radio button selection
  if (!previousNamesRadio) {
    const errorMessage = lookupWebValidationMessage(formerNamesErrorMessageKey.FORMER_NAMES_RADIO_UNSELECTED);
    validationErrors.push(createValidationError(errorMessage, [DirectorField.PREVIOUS_NAMES_RADIO], DirectorField.YES));
  } 
  else if (previousNamesRadio == DirectorField.YES) {
    if (!previousNames || previousNames.length == 0) {
      const errorMessage = lookupWebValidationMessage(formerNamesErrorMessageKey.FORMER_NAMES_MISSING);
      validationErrors.push(createValidationErrorBasic(errorMessage, DirectorField.PREVIOUS_NAMES));
    }

    var formerNamesKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, formerNamesErrorMessageKey);
    if (formerNamesKey) {
      validationErrors.push(createValidationErrorBasic(formerNamesKey, DirectorField.PREVIOUS_NAMES));
    }
  }

  return validationErrors;
}
