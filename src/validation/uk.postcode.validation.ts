import { PostcodeValidationType, ValidationError } from "../model/validation.model";
import { getIsValidUKPostcode } from "../services/postcode.lookup.service";

export const validateUKPostcode = async (postcodeValidationUrl: string,
										postcode: string,
										postcodeValidationType: PostcodeValidationType,
										validationErrors: ValidationError[]) => {

	const isValid = await getIsValidUKPostcode(postcodeValidationUrl, postcode);
	if(!isValid) {
		validationErrors.push(postcodeValidationType.InvalidValue.Postcode);
	}

	return validationErrors;
}