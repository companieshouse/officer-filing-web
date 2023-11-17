import {
	ManualAddressValidationType,
	PostcodeValidationType,
	PremiseValidationType
} from "../model/validation.model";
import {
	premisesErrorMessageKey,
	postcodeErrorMessageKey,
	addressAddressLineTwoErrorMessageKey,
	addressCountryErrorMessageKey,
	addressPostcodeErrorMessageKey,
	addressRegionErrorMessageKey,
	addressPremisesErrorMessageKey,
	addressAddressLineOneErrorMessageKey,
	addressLocalityErrorMessageKey,
} from "../utils/api.enumerations.keys";
import { CorrespondenceAddressField, PostcodeField, PremiseField, ResidentialAddressField } from "../model/address.model";

// Configuration required for manual address validation error messages
export const CorrespondenceManualAddressValidation: ManualAddressValidationType = {
	MissingValue: {
		Premise: {
			messageKey: addressPremisesErrorMessageKey.PREMISES_BLANK,
			source: [CorrespondenceAddressField.PREMISE],
			link: CorrespondenceAddressField.PREMISE
		},
		AddressLine1: {
			messageKey: addressAddressLineOneErrorMessageKey.ADDRESS_LINE_1_BLANK,
			source: [CorrespondenceAddressField.ADDRESS_LINE_1],
			link: CorrespondenceAddressField.ADDRESS_LINE_1
		},
		City: {
			messageKey: addressLocalityErrorMessageKey.LOCALITY_BLANK,
			source: [CorrespondenceAddressField.CITY],
			link: CorrespondenceAddressField.CITY
		},
		Country: {
			messageKey: addressCountryErrorMessageKey.COUNTRY_BLANK,
			source: [CorrespondenceAddressField.COUNTRY],
			link: CorrespondenceAddressField.COUNTRY
		},
		Postcode: {
			messageKey: addressPostcodeErrorMessageKey.POSTAL_CODE_BLANK,
			source: [CorrespondenceAddressField.POSTCODE],
			link: CorrespondenceAddressField.POSTCODE
		}
	},
	InvalidCharacters: {
		Premise: {
			messageKey: addressPremisesErrorMessageKey.PREMISES_CHARACTERS,
			source: [CorrespondenceAddressField.PREMISE],
			link: CorrespondenceAddressField.PREMISE
		},
		AddressLine1: {
			messageKey: addressAddressLineOneErrorMessageKey.ADDRESS_LINE_1_CHARACTERS,
			source: [CorrespondenceAddressField.ADDRESS_LINE_1],
			link: CorrespondenceAddressField.ADDRESS_LINE_1
		},
		AddressLine2: {
			messageKey: addressAddressLineTwoErrorMessageKey.ADDRESS_LINE_2_CHARACTERS,
			source: [CorrespondenceAddressField.ADDRESS_LINE_2],
			link: CorrespondenceAddressField.ADDRESS_LINE_2
		},
		City: {
			messageKey: addressLocalityErrorMessageKey.LOCALITY_CHARACTERS,
			source: [CorrespondenceAddressField.CITY],
			link: CorrespondenceAddressField.CITY
		},
		County: {
			messageKey: addressRegionErrorMessageKey.REGION_CHARACTERS,
			source: [CorrespondenceAddressField.COUNTY],
			link: CorrespondenceAddressField.COUNTY
		},
		Postcode: {
			messageKey: addressPostcodeErrorMessageKey.POSTAL_CODE_CHARACTERS,
			source: [CorrespondenceAddressField.POSTCODE],
			link: CorrespondenceAddressField.POSTCODE
		},
	},
	InvalidLength: {
		Premise: {
			messageKey: addressPremisesErrorMessageKey.PREMISES_LENGTH,
			source: [CorrespondenceAddressField.PREMISE],
			link: CorrespondenceAddressField.PREMISE
		},
		AddressLine1: {
			messageKey: addressAddressLineOneErrorMessageKey.ADDRESS_LINE_1_LENGTH,
			source: [CorrespondenceAddressField.ADDRESS_LINE_1],
			link: CorrespondenceAddressField.ADDRESS_LINE_1
		},
		AddressLine2: {
			messageKey: addressAddressLineTwoErrorMessageKey.ADDRESS_LINE_2_LENGTH,
			source: [CorrespondenceAddressField.ADDRESS_LINE_2],
			link: CorrespondenceAddressField.ADDRESS_LINE_2
		},
		City: {
			messageKey: addressLocalityErrorMessageKey.LOCALITY_LENGTH,
			source: [CorrespondenceAddressField.CITY],
			link: CorrespondenceAddressField.CITY
		},
		County: {
			messageKey: addressRegionErrorMessageKey.REGION_LENGTH,
			source: [CorrespondenceAddressField.COUNTY],
			link: CorrespondenceAddressField.COUNTY
		},
		Postcode: {
			messageKey: addressPostcodeErrorMessageKey.POSTAL_CODE_LENGTH,
			source: [CorrespondenceAddressField.POSTCODE],
			link: CorrespondenceAddressField.POSTCODE
		}
	},
	InvalidValue: {
		Country: {
			messageKey: addressCountryErrorMessageKey.COUNTRY_INVALID,
			source: [CorrespondenceAddressField.COUNTRY],
			link: CorrespondenceAddressField.COUNTRY
		}
	}
}

export const ResidentialManualAddressValidation: ManualAddressValidationType = {
	MissingValue: {
		Premise: {
			messageKey: addressPremisesErrorMessageKey.PREMISES_BLANK,
			source: [ResidentialAddressField.PREMISE],
			link: ResidentialAddressField.PREMISE
		},
		AddressLine1: {
			messageKey: addressAddressLineOneErrorMessageKey.ADDRESS_LINE_1_BLANK,
			source: [ResidentialAddressField.ADDRESS_LINE_1],
			link: ResidentialAddressField.ADDRESS_LINE_1
		},
		City: {
			messageKey: addressLocalityErrorMessageKey.LOCALITY_BLANK,
			source: [ResidentialAddressField.CITY],
			link: ResidentialAddressField.CITY
		},
		Country: {
			messageKey: addressCountryErrorMessageKey.COUNTRY_BLANK,
			source: [ResidentialAddressField.COUNTRY],
			link: ResidentialAddressField.COUNTRY
		},
		Postcode: {
			messageKey: addressPostcodeErrorMessageKey.POSTAL_CODE_BLANK,
			source: [ResidentialAddressField.POSTCODE],
			link: ResidentialAddressField.POSTCODE
		}
	},
	InvalidCharacters: {
		Premise: {
			messageKey: addressPremisesErrorMessageKey.PREMISES_CHARACTERS,
			source: [ResidentialAddressField.PREMISE],
			link: ResidentialAddressField.PREMISE
		},
		AddressLine1: {
			messageKey: addressAddressLineOneErrorMessageKey.ADDRESS_LINE_1_CHARACTERS,
			source: [ResidentialAddressField.ADDRESS_LINE_1],
			link: ResidentialAddressField.ADDRESS_LINE_1
		},
		AddressLine2: {
			messageKey: addressAddressLineTwoErrorMessageKey.ADDRESS_LINE_2_CHARACTERS,
			source: [ResidentialAddressField.ADDRESS_LINE_2],
			link: ResidentialAddressField.ADDRESS_LINE_2
		},
		City: {
			messageKey: addressLocalityErrorMessageKey.LOCALITY_CHARACTERS,
			source: [ResidentialAddressField.CITY],
			link: ResidentialAddressField.CITY
		},
		County: {
			messageKey: addressRegionErrorMessageKey.REGION_CHARACTERS,
			source: [ResidentialAddressField.COUNTY],
			link: ResidentialAddressField.COUNTY
		},
		Postcode: {
			messageKey: addressPostcodeErrorMessageKey.POSTAL_CODE_CHARACTERS,
			source: [ResidentialAddressField.POSTCODE],
			link: ResidentialAddressField.POSTCODE
		},
	},
	InvalidLength: {
		Premise: {
			messageKey: addressPremisesErrorMessageKey.PREMISES_LENGTH,
			source: [ResidentialAddressField.PREMISE],
			link: ResidentialAddressField.PREMISE
		},
		AddressLine1: {
			messageKey: addressAddressLineOneErrorMessageKey.ADDRESS_LINE_1_LENGTH,
			source: [ResidentialAddressField.ADDRESS_LINE_1],
			link: ResidentialAddressField.ADDRESS_LINE_1
		},
		AddressLine2: {
			messageKey: addressAddressLineTwoErrorMessageKey.ADDRESS_LINE_2_LENGTH,
			source: [ResidentialAddressField.ADDRESS_LINE_2],
			link: ResidentialAddressField.ADDRESS_LINE_2
		},
		City: {
			messageKey: addressLocalityErrorMessageKey.LOCALITY_LENGTH,
			source: [ResidentialAddressField.CITY],
			link: ResidentialAddressField.CITY
		},
		County: {
			messageKey: addressRegionErrorMessageKey.REGION_LENGTH,
			source: [ResidentialAddressField.COUNTY],
			link: ResidentialAddressField.COUNTY
		},
		Postcode: {
			messageKey: addressPostcodeErrorMessageKey.POSTAL_CODE_LENGTH,
			source: [ResidentialAddressField.POSTCODE],
			link: ResidentialAddressField.POSTCODE
		}
	},
	InvalidValue: {
		Country: {
			messageKey: addressCountryErrorMessageKey.COUNTRY_INVALID,
			source: [ResidentialAddressField.COUNTRY],
			link: ResidentialAddressField.COUNTRY
		}
	}
}


// Configuration required for postcode validation error messages
export const PostcodeValidation: PostcodeValidationType = {
	MissingValue: {
		Postcode: {
			messageKey: postcodeErrorMessageKey.POSTCODE_BLANK,
			source: [PostcodeField.POSTCODE],
			link: PostcodeField.POSTCODE
		}
	},
	InvalidCharacters: {
		Postcode: {
			messageKey: postcodeErrorMessageKey.POSTCODE_CHARACTERS,
			source: [PostcodeField.POSTCODE],
			link: PostcodeField.POSTCODE
		}
	},
	InvalidLength: {
		Postcode: {
			messageKey: postcodeErrorMessageKey.POSTCODE_LENGTH,
			source: [PostcodeField.POSTCODE],
			link: PostcodeField.POSTCODE
		}
	},
	InvalidValue: {
		Postcode: {
			messageKey: postcodeErrorMessageKey.POSTCODE_INVALID,
			source: [PostcodeField.POSTCODE],
			link: PostcodeField.POSTCODE
		}
	}
}

// Configuration required for premise validation error messages
export const PremiseValidation: PremiseValidationType = {
	InvalidCharacters: {
		Premise: {
			messageKey: premisesErrorMessageKey.PREMISES_CHARACTERS,
			source: [PremiseField.PREMISE],
			link: PremiseField.PREMISE
		}
	},
	InvalidLength: {
		Premise: {
			messageKey: premisesErrorMessageKey.PREMISES_LENGTH,
			source: [PremiseField.PREMISE],
			link: PremiseField.PREMISE
		}
	}
}