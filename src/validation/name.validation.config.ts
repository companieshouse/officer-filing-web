import { titleErrorMessageKey, firstNameErrorMessageKey, middleNameErrorMessageKey, lastNameErrorMessageKey, formerNamesErrorMessageKey } from "../utils/api.enumerations.keys";
import { DirectorField } from "../model/director.model";
import { NameValidationType } from "../model/validation.model";

// Configuration required for name validation error messages
export const NameValidation: NameValidationType = {
    TitleInvalidCharacter: {
        Name: {
            messageKey: titleErrorMessageKey.TITLE_CHARACTERS,
            source: [DirectorField.TITLE],
            link: DirectorField.TITLE
        }
    },
    TitleLength: {
        Name: {
            messageKey: titleErrorMessageKey.TITLE_LENGTH,
            source: [DirectorField.TITLE],
            link: DirectorField.TITLE
        }
    },
    FirstNameBlank: {
        Name: {
            messageKey: firstNameErrorMessageKey.FIRST_NAME_BLANK,
            source: [DirectorField.FIRST_NAME],
            link: DirectorField.FIRST_NAME
        }
    },
    FirstNameInvalidCharacter: {
        Name: {
            messageKey: firstNameErrorMessageKey.FIRST_NAME_CHARACTERS,
            source: [DirectorField.FIRST_NAME],
            link: DirectorField.FIRST_NAME
        }
    },
    FirstNameLength: {
        Name: {
            messageKey: firstNameErrorMessageKey.FIRST_NAME_LENGTH,
            source: [DirectorField.FIRST_NAME],
            link: DirectorField.FIRST_NAME
        }
    },
    MiddleNamesInvalidCharacter: {
        Name: {
            messageKey: middleNameErrorMessageKey.MIDDLE_NAME_CHARACTERS,
            source: [DirectorField.MIDDLE_NAMES],
            link: DirectorField.MIDDLE_NAMES
        }
    },
    MiddleNamesLength: {
        Name: {
            messageKey: middleNameErrorMessageKey.MIDDLE_NAME_LENGTH,
            source: [DirectorField.MIDDLE_NAMES],
            link: DirectorField.MIDDLE_NAMES
        }
    },
    LastNameBlank: {
        Name: {
            messageKey: lastNameErrorMessageKey.LAST_NAME_BLANK,
            source: [DirectorField.LAST_NAME],
            link: DirectorField.LAST_NAME
        }
    },
    LastNameInvalidCharacter: {
        Name: {
            messageKey: lastNameErrorMessageKey.LAST_NAME_CHARACTERS,
            source: [DirectorField.LAST_NAME],
            link: DirectorField.LAST_NAME
        }
    },
    LastNameLength: {
        Name: {
            messageKey: lastNameErrorMessageKey.LAST_NAME_LENGTH,
            source: [DirectorField.LAST_NAME],
            link: DirectorField.LAST_NAME
        }
    },
    PreviousNamesRadioUnselected: {
        Name: {
            messageKey: formerNamesErrorMessageKey.FORMER_NAMES_RADIO_UNSELECTED,
            source: [DirectorField.PREVIOUS_NAMES_RADIO],
            link: DirectorField.PREVIOUS_NAMES_RADIO
        }
    },
    PreviousNamesMissing: {
        Name: {
            messageKey: formerNamesErrorMessageKey.FORMER_NAMES_MISSING,
            source: [DirectorField.PREVIOUS_NAMES],
            link: DirectorField.PREVIOUS_NAMES
        }
    },
    PreviousNamesInvalidCharacter: {
        Name: {
            messageKey: formerNamesErrorMessageKey.FORMER_NAMES_CHARACTERS,
            source: [DirectorField.PREVIOUS_NAMES],
            link: DirectorField.PREVIOUS_NAMES
        }
    },
    PreviousNamesLength: {
        Name: {
            messageKey: formerNamesErrorMessageKey.FORMER_NAMES_LENGTH,
            source: [DirectorField.PREVIOUS_NAMES],
            link: DirectorField.PREVIOUS_NAMES
        }
    }
}