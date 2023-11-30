import { nationalityErrorMessageKey, nationalityOneErrorMessageKey, nationalityThreeErrorMessageKey, nationalityTwoErrorMessageKey } from "../utils/api.enumerations.keys";
import { DirectorField } from "../model/director.model";
import { NationalityValidationType } from "../model/validation.model";

// Configuration required for nationality validation error messages
export const NationalityValidation: NationalityValidationType = {
  Nationality1Blank: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_MISSING,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  Nationality1InvalidCharacter: {
    Nationality: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  Nationality2InvalidCharacter: {
    Nationality: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  Nationality3InvalidCharacter: {
    Nationality: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  Nationality1AllowedList: {
    Nationality: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  Nationality2AllowedList: {
    Nationality: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  Nationality3AllowedList: {
    Nationality: {
      messageKey: nationalityErrorMessageKey.NATIONALITY_INVALID,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  Nationality1LengthValidator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  Nationality2LengthValidator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  Nationality3LengthValidator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  DualNationality1LengthValidator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_49,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  DualNationality2LengthValidator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_49,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  DualNationality3LengthValidator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_49,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  MultipleNationality1maxLength48Validator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  MultipleNationality2maxLength48Validator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  MultipleNationality3maxLength48Validator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  MultipleNationality1maxLength50Validator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_1],
      link: DirectorField.NATIONALITY_1
    }
  },
  MultipleNationality2maxLength50Validator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  MultipleNationality3maxLength50Validator: {
    Nationality: {
      messageKey: nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  },
  DuplicatedNationality2Validator: {
    Nationality: {
      messageKey: nationalityTwoErrorMessageKey.NATIONALITY_2_DUPLICATE,
      source: [DirectorField.NATIONALITY_2],
      link: DirectorField.NATIONALITY_2
    }
  },
  DuplicatedNationality3Validator: {
    Nationality: {
      messageKey: nationalityThreeErrorMessageKey.NATIONALITY_3_DUPLICATE,
      source: [DirectorField.NATIONALITY_3],
      link: DirectorField.NATIONALITY_3
    }
  }
}