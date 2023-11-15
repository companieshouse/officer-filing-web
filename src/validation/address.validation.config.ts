import {PostcodeValidationType, PremiseValidationType} from "../model/validation.model";
import {premisesErrorMessageKey, postcodeErrorMessageKey} from "../utils/api.enumerations.keys";
import {PostcodeField, PremiseField} from "../model/address.model";

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
	},
	InvalidPostcode: {
		Postcode: {
			messageKey: postcodeErrorMessageKey.POSTCODE_FULL_INVALID,
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