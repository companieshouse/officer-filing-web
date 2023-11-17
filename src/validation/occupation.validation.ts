import { OccupationValidationType, ValidationError } from "../model/validation.model";

const REGEX_FOR_OCCUPATION = /^[ -,.:;0-9A-Z&@$£¥€'"«»""?!/\\()\[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$/;
const OCCUPATION_LENGTH = 100;

export const validateOccupation = (occupation: string, occupationValidationType: OccupationValidationType): ValidationError | undefined => {
    if(occupation) {
        const invalidOccupationCharacterValidationResult = validateInvalidCharacterValuesForOccupation(occupation, occupationValidationType);
        //Invalid Characters
        if(invalidOccupationCharacterValidationResult) {
            return invalidOccupationCharacterValidationResult;
        }

        const invalidOccupationLengthValidationResult = validateInvalidLengthValuesForOccupation(occupation, occupationValidationType);
        //Invalid Length
        if(invalidOccupationLengthValidationResult) {
            return invalidOccupationLengthValidationResult;
        }
    }
    return undefined;
}

/**
 * Validate the occupation field for invalid character set
 * @param occupation 
 * @param occupationValidationType 
 * @returns the validation error if the occupation field is invalid, otherwise undefined
 */
const validateInvalidCharacterValuesForOccupation = (occupation: string, occupationValidationType: OccupationValidationType): ValidationError | undefined => {
    if(!occupation.match(REGEX_FOR_OCCUPATION)) {
        return occupationValidationType.InvalidCharacters.Occupation;
    }
    return undefined;
}
/**
 * Validate the occupation field for length
 * @param occupation 
 * @param occupationValidationType 
 * @returns the validation error if the occupation field is invalid, otherwise undefined
 */
const validateInvalidLengthValuesForOccupation = (occupation: string, occupationValidationType: OccupationValidationType): ValidationError | undefined => { 
    if(occupation.length > OCCUPATION_LENGTH) {
        return occupationValidationType.InvalidLength.Occupation;
    }
    return undefined;
}