import { OccupationValidationType, ValidationError } from "../model/validation.model";
import { REGEX_FOR_VALID_CHARACTERS } from "./validation";

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
    const regex = REGEX_FOR_VALID_CHARACTERS;
    const match = regex.exec(occupation);
    if (!match) {
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