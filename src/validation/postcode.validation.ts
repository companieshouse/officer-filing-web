import {PostcodeValidationType, ValidationError} from "model/validation.model";

const REGEX_FOR_POSTCODE = /^[A-Za-z0-9\s]*$/;
export const validatePostcode = (postcode: string,
                                 postcodeValidationType : PostcodeValidationType): ValidationError[] => {
    let validationErrors: ValidationError[] = [];

    //Postcode validation
    //Missing values
    const missingPostcodeValuesValidationResult = validateMissingValues(postcode, postcodeValidationType);
    if (missingPostcodeValuesValidationResult) {
        validationErrors.push(missingPostcodeValuesValidationResult);
        return validationErrors;
    }

    //Invalid characters
    const invalidPostcodeCharacterValidationResult = validateCharacterForPostcode(postcode, postcodeValidationType);
    if (invalidPostcodeCharacterValidationResult) {
      validationErrors.push(invalidPostcodeCharacterValidationResult);
      return validationErrors;
    }

    //Invalid length
    const invalidPostcodeLengthValidationResult = validateLengthForPostcode(postcode, postcodeValidationType);
    if (invalidPostcodeLengthValidationResult) {
      validationErrors.push(invalidPostcodeLengthValidationResult);
      return validationErrors;
    }

    return validationErrors;
}

/**
 * Validate the postcode field and return a validation error if the field is empty
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateMissingValues = (postcode: string | undefined, postcodeValidationType : PostcodeValidationType): ValidationError | undefined => {
    if (postcode === null || postcode === undefined || postcode === ""){
        return postcodeValidationType.MissingValue.Postcode;
    }
    return undefined;
}

/**
 * Validate the postcode field and return a validation error if the field contains invalid characters
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateCharacterForPostcode = (postcode: string, postcodeValidationType : PostcodeValidationType): ValidationError | undefined => {
    if (!postcode.match(REGEX_FOR_POSTCODE)) {
        return postcodeValidationType.InvalidCharacters.Postcode;
    }
    return undefined;
}

/**
 * Validate the postcode field and return a validation error if the field length is invalid
 * @returns A ValidationError object if one occurred, else undefined
 */

const validateLengthForPostcode = (postcode: string, postcodeValidationType : PostcodeValidationType): ValidationError | undefined => {
    if (postcode.length > 20) {
        return postcodeValidationType.InvalidLength.Postcode;
    }
    return undefined;
}