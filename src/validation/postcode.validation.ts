import {PostcodeValidationType, PremiseValidationType, ValidationError} from "model/validation.model";

const REGEX_FOR_POSTCODE = /^[A-Za-z0-9\s]*$/;
const REGEX_FOR_PREMISE = /^[-,.:;A-Za-z0-9&@$£¥€'"«»?!/\\()\[\]{}<>=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž\s]*$/;
export const validatePremiseAndPostcode = (postcode: string,
                                           postcodeValidationType : PostcodeValidationType,
                                           premisesValidationType: PremiseValidationType,
                                           premise?: string): ValidationError[] => {
    let validationErrors: ValidationError[] = [];

    //Postcode validation
    //Missing values
    const missingPostcodeValuesValidationResult = validateMissingValues(postcode, postcodeValidationType);
    if (missingPostcodeValuesValidationResult) {
        validationErrors.push(missingPostcodeValuesValidationResult);
    }

    //Invalid characters
    const invalidPostcodeCharacterValidationResult = validateCharacterForPostcode(postcode, postcodeValidationType);
    if (invalidPostcodeCharacterValidationResult) {
      validationErrors.push(invalidPostcodeCharacterValidationResult);
    }

    //Invalid length
    const invalidPostcodeLengthValidationResult = validateLengthForPostcode(postcode, postcodeValidationType);
    if (invalidPostcodeLengthValidationResult) {
      validationErrors.push(invalidPostcodeLengthValidationResult);
    }

    //Premise validation
    if (premise != null) {
        const invalidPremisesCharacterValidationResult = validateInvalidCharacterValuesForPremise(premise, premisesValidationType);
        if(invalidPremisesCharacterValidationResult) {
            validationErrors.push(invalidPremisesCharacterValidationResult);
        }

        const invalidPremisesLengthValidationResult = validateLengthForPremise(premise, premisesValidationType);
        if(invalidPremisesLengthValidationResult) {
            validationErrors.push(invalidPremisesLengthValidationResult);
        }
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
 * Validate the premise field and return a validation error if the field contains invalid characters
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateInvalidCharacterValuesForPremise = (premise: string, premiseValidationType : PremiseValidationType): ValidationError | undefined => {
    if (!premise.match(REGEX_FOR_PREMISE)) {
        return premiseValidationType.InvalidCharacters.Premise;
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

/**
 * Validate the premise field and return a validation error if the field length is invalid
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateLengthForPremise = (premise: string, premiseValidationType : PremiseValidationType): ValidationError | undefined => {
    if (premise.length > 200) {
        return premiseValidationType.InvalidLength.Premise;
    }
    return undefined;
}