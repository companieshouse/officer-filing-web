import { occupationErrorMessageKey } from "../utils/api.enumerations.keys";
import { OccupationValidationType } from "../model/validation.model";
import { DirectorField } from "../model/director.model";

// Configuration required for occupation validation error messages
export const OccupationValidation: OccupationValidationType = {
    InvalidCharacters: {
        Occupation: {
            messageKey: occupationErrorMessageKey.OCCUPATION_CHARACTERS,
            source: [DirectorField.OCCUPATION],
            link: DirectorField.OCCUPATION
        }
    },
    InvalidLength: {
        Occupation: {
            messageKey: occupationErrorMessageKey.OCCUPATION_LENGTH,
            source: [DirectorField.OCCUPATION],
            link: DirectorField.OCCUPATION
        }
    }
}