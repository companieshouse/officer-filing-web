import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { FormattedValidationErrors, ValidationError } from "../model/validation.model";
import { convertAPIMessageToKey, lookupAPIValidationMessage, lookupWebValidationMessage } from "../utils/api.enumerations";
import { getLocalesService } from "../utils/localise";

/**
 * Regex for valid characters
 */
export const REGEX_FOR_VALID_CHARACTERS = /^[-,.:; 0-9A-Z&@$£¥€'"«»''""?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$/;

/**
 * Regex for valid UK postcode
 */
export const REGEX_FOR_VALID_UK_POSTCODE = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/;

/**
 * Regex for valid names:
 * Does not allow numbers, but does allow hyphens, space and apostrophes
 */
export const REGEX_FOR_VALID_NAME = /^[ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽ'A-Za-zſƒǺàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž -]*$/;

/**
 * Regex for valid name title:
 * Additionally allows . "
 */
export const REGEX_FOR_NAME_TITLE = /^[ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽ'.A-Za-zſƒǺàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž -]*$/;

/**
 * Regex for valid former names:
 * Does not allow numbers, but does allow hyphens, space, apostrophes and commas
 */
export const REGEX_FOR_VALID_FORMER_NAMES = /^[ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽ'A-Za-zſƒǺàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž, -]*$/;

/**
 * Format the validation errors to display to the user. Map the error message key to the actual error message using api-enumerations.
 * @param validationErrors Contains the error message, the fields to highlight, and the field to link when the error message is clicked
 * @param lang The language to display the error message in
 * @returns A validation errors object to display on the page
 */
export function formatValidationErrors(validationErrors: ValidationError[], lang?: string): FormattedValidationErrors {
  const errors = { errorList: [] } as any;
  const localesService = getLocalesService();
  validationErrors.forEach(validationResult => {
    let errorMessage = validationResult.messageKey;
    if (lang != undefined) {
      const error = localesService.i18nCh.resolveSingleKey("error-" + validationResult.messageKey, lang);
      if (!error.startsWith("error-")) {
        errorMessage = error;
      }
    }
    if (errorMessage == validationResult.messageKey) {
      errorMessage = lookupWebValidationMessage(validationResult.messageKey);
    }
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