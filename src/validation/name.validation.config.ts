import { titleErrorMessageKey, firstNameErrorMessageKey, middleNameErrorMessageKey, lastNameErrorMessageKey, formerNamesErrorMessageKey } from "../utils/api.enumerations.keys";
import { DirectorField } from "../model/director.model";
import { GenericValidationType } from "../model/validation.model";

// Configuration required for name validation error messages
export const NameValidation: GenericValidationType = {
    TitleInvalidCharacter: {
        ErrorField: {
            messageKey: titleErrorMessageKey.TITLE_CHARACTERS,
            source: [DirectorField.TITLE],
            link: DirectorField.TITLE
        }
    },
    TitleLength: {
        ErrorField: {
            messageKey: titleErrorMessageKey.TITLE_LENGTH,
            source: [DirectorField.TITLE],
            link: DirectorField.TITLE
        }
    },
    FirstNameBlank: {
        ErrorField: {
            messageKey: firstNameErrorMessageKey.FIRST_NAME_BLANK,
            source: [DirectorField.FIRST_NAME],
            link: DirectorField.FIRST_NAME
        }
    },
    FirstNameInvalidCharacter: {
        ErrorField: {
            messageKey: firstNameErrorMessageKey.FIRST_NAME_CHARACTERS,
            source: [DirectorField.FIRST_NAME],
            link: DirectorField.FIRST_NAME
        }
    },
    FirstNameLength: {
        ErrorField: {
            messageKey: firstNameErrorMessageKey.FIRST_NAME_LENGTH,
            source: [DirectorField.FIRST_NAME],
            link: DirectorField.FIRST_NAME
        }
    },
    MiddleNamesInvalidCharacter: {
        ErrorField: {
            messageKey: middleNameErrorMessageKey.MIDDLE_NAME_CHARACTERS,
            source: [DirectorField.MIDDLE_NAMES],
            link: DirectorField.MIDDLE_NAMES
        }
    },
    MiddleNamesLength: {
        ErrorField: {
            messageKey: middleNameErrorMessageKey.MIDDLE_NAME_LENGTH,
            source: [DirectorField.MIDDLE_NAMES],
            link: DirectorField.MIDDLE_NAMES
        }
    },
    LastNameBlank: {
        ErrorField: {
            messageKey: lastNameErrorMessageKey.LAST_NAME_BLANK,
            source: [DirectorField.LAST_NAME],
            link: DirectorField.LAST_NAME
        }
    },
    LastNameInvalidCharacter: {
        ErrorField: {
            messageKey: lastNameErrorMessageKey.LAST_NAME_CHARACTERS,
            source: [DirectorField.LAST_NAME],
            link: DirectorField.LAST_NAME
        }
    },
    LastNameLength: {
        ErrorField: {
            messageKey: lastNameErrorMessageKey.LAST_NAME_LENGTH,
            source: [DirectorField.LAST_NAME],
            link: DirectorField.LAST_NAME
        }
    },
    PreviousNamesRadioUnselected: {
        ErrorField: {
            messageKey: formerNamesErrorMessageKey.FORMER_NAMES_RADIO_UNSELECTED,
            source: [DirectorField.PREVIOUS_NAMES_RADIO],
            link: DirectorField.YES
        }
    },
    PreviousNamesMissing: {
        ErrorField: {
            messageKey: formerNamesErrorMessageKey.FORMER_NAMES_MISSING,
            source: [DirectorField.PREVIOUS_NAMES],
            link: DirectorField.PREVIOUS_NAMES
        }
    },
    PreviousNamesInvalidCharacter: {
        ErrorField: {
            messageKey: formerNamesErrorMessageKey.FORMER_NAMES_CHARACTERS,
            source: [DirectorField.PREVIOUS_NAMES],
            link: DirectorField.PREVIOUS_NAMES
        }
    },
    PreviousNamesLength: {
        ErrorField: {
            messageKey: formerNamesErrorMessageKey.FORMER_NAMES_LENGTH,
            source: [DirectorField.PREVIOUS_NAMES],
            link: DirectorField.PREVIOUS_NAMES
        }
    }
}