import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { FormattedValidationErrors, ValidationError } from "../model/validation.model";
import { convertAPIMessageToKey, lookupAPIValidationMessage, lookupWebValidationMessage } from "../utils/api.enumerations";


/**
 * Format the validation errors to display to the user. Map the error message key to the actual error message using api-enumerations.
 * @param validationErrors Contains the error message, the fields to highlight, and the field to link when the error message is clicked
 * @returns A validation errors object to display on the page
 */
export function formatValidationErrors(validationErrors: ValidationError[]): FormattedValidationErrors {
  const errors = { errorList: [] } as any;

  validationErrors.forEach(validationResult => {
    let errorMessage = lookupWebValidationMessage(validationResult.messageKey);
    if (errorMessage == validationResult.messageKey) {
      errorMessage = lookupAPIValidationMessage(validationResult.messageKey)
    }
    
    // errors.errorList[] relates to the linked error messages at the top of the page
    errors.errorList.push({ href: '#' + validationResult.link, text: errorMessage });
    
    // errors[] relates to the highlighed fields and the message just above those fields
    validationResult.source.forEach(field => {
      errors[field] = { text: errorMessage };
    });
  });

  return errors;
}

/**
 * Maps API error messages to an error key in the given enum
 * @param validationStatusResponse Response from getValidation endpoint, this contains all errors from the validation
 * @param allowedKeyEnum Enum containining the errors that are allowed to be mapped. The order of the values within this enum defines priority order of the messages.
 * @returns An allowed error message key, or an empty string
 */
export const mapValidationResponseToAllowedErrorKey = (validationStatusResponse: ValidationStatusResponse, allowedKeyEnum: any): string => {
    var listOfValidationKeys = new Array();
    if (!validationStatusResponse || !validationStatusResponse.errors) {
        return "";
    }
  
    // Map the error message returned from officer filing api to an errorMessageKey
    validationStatusResponse.errors.forEach(element => {
      listOfValidationKeys.push(convertAPIMessageToKey(element.error));
    });
  
    // If the errorMessageKey of the validation response matches one of the given allowed keys then allow it - these values are ordered by priority
    for (var key of Object.values(allowedKeyEnum)) {
      if (listOfValidationKeys.includes(key)) {
        return key as string;
      }
    }
  
    return "";
};

/**
 * Create a Validation Error object that will contain the necessary information to display on the page
 * @param messageKey The message to show to the user
 * @param sourceAndLink The page element that will be both highlighted and linked to
 * @returns An error object to display on the page
 */
export const createValidationErrorBasic = (messageKey: string, sourceAndLink: string): ValidationError => {
    return createValidationError(messageKey, [sourceAndLink], sourceAndLink);
};

/**
 * Create a Validation Error object that will contain the necessary information to display on the page
 * @param messageKey The message to show to the user
 * @param source The page element that will be highlighted on the page
 * @param link The page element that will be linked to on the error
 * @returns An error object to display on the page
 */
export const createValidationError = (messageKey: string, source: string[], link: string): ValidationError => {
  return {
      messageKey: messageKey,
      source: source,
      link: link
  };
};