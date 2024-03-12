import { nationalityErrorMessageKey, nationalityOneErrorMessageKey, nationalityThreeErrorMessageKey, nationalityTwoErrorMessageKey } from "../utils/api.enumerations.keys";
import { DirectorField } from "../model/director.model";
import { GenericValidationType } from "../model/validation.model";

// Configuration required for nationality validation error messages
export const NationalityValidation: GenericValidationType = {
  Nationality1Blank: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_MISSING,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  Nationality1InvalidCharacter: {
    ErrorField: {
      messageKey: nationalityErrorMessageKey.INVALID_NATIONALITY_CHARACTER,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  Nationality2InvalidCharacter: {
    ErrorField: {
      messageKey: nationalityErrorMessageKey.INVALID_NATIONALITY_CHARACTER,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  Nationality3InvalidCharacter: {
    ErrorField: {
      messageKey: nationalityErrorMessageKey.INVALID_NATIONALITY_CHARACTER,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  Nationality1AllowedList: {
    ErrorField: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  Nationality2AllowedList: {
    ErrorField: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  Nationality3AllowedList: {
    ErrorField: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  Nationality1LengthValidator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  Nationality2LengthValidator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  Nationality3LengthValidator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  DualNationality1LengthValidator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_49,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  DualNationality2LengthValidator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_49,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  DualNationality3LengthValidator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_49,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  MultipleNationality1maxLength48Validator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  MultipleNationality2maxLength48Validator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  MultipleNationality3maxLength48Validator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  MultipleNationality1maxLength50Validator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  MultipleNationality2maxLength50Validator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  MultipleNationality3maxLength50Validator: {
    ErrorField: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  DuplicatedNationality2Validator: {
    ErrorField: {
      messageKey: nationalityTwoErrorMessageKey.NATIONALITY_2_DUPLICATE,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  DuplicatedNationality3Validator: {
    ErrorField: {
      messageKey: nationalityThreeErrorMessageKey.NATIONALITY_3_DUPLICATE,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  }
}