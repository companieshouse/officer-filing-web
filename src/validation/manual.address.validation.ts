import { Address } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { ManualAddressValidationType, ValidationError } from "../model/validation.model";
import { COUNTRY_LIST, UK_COUNTRY_LIST } from "../utils/properties";
import { REGEX_FOR_VALID_CHARACTERS, REGEX_FOR_VALID_UK_POSTCODE } from "./validation";

const PREMISE_ALLOWED_LENGTH = 200;
const POSTCODE_ALLOWED_LENGTH = 20;
const ALLOWED_LENGTH = 50;

export const validateManualAddress = (address: Address, manualAddressValidationType: ManualAddressValidationType): ValidationError[] => {
	let validationErrors: ValidationError[] = [];

	// Premises
	if(!address.premises) {
		validationErrors.push(manualAddressValidationType.MissingValue.Premise);
	} else {
		validationErrors = validatePremise(address.premises, manualAddressValidationType, validationErrors);
	}

	// Address Line 1
	if(!address.addressLine1) {
		validationErrors.push(manualAddressValidationType.MissingValue.AddressLine1);
	} else {
		validationErrors = validateAddressLine1(address.addressLine1, manualAddressValidationType, validationErrors);
	}

	// Address Line 2
	if(address.addressLine2) {
		validationErrors = validateAddressLine2(address.addressLine2, manualAddressValidationType, validationErrors);
	}

	// City
	if(!address.locality) {
		validationErrors.push(manualAddressValidationType.MissingValue.City);
	} else {
		validationErrors = validateCity(address.locality, manualAddressValidationType, validationErrors);
	}

	// County, Town, Province, Region
	if(address.region) {
		validationErrors = validateCounty(address.region, manualAddressValidationType, validationErrors);
	}

	// Country && postcode
	validationErrors = validateCountryAndPostcode(address.country, address.postalCode?.replace(/\s/g, "").trim().toUpperCase()!, manualAddressValidationType, validationErrors);

	return validationErrors;
}

/**
 * Validate premise
 * @param premise
 * @param manualAddressValidationType
 * @param validationErrors
 */
export const validatePremise = (premise: string, manualAddressValidationType: ManualAddressValidationType, validationErrors: ValidationError[]): ValidationError[] => {
	const regex = REGEX_FOR_VALID_CHARACTERS;
	const match = regex.exec(premise);
	if (!match) {
		validationErrors.push(manualAddressValidationType.InvalidCharacters.Premise);
		return validationErrors;
	}

	if(premise.length > PREMISE_ALLOWED_LENGTH) {
		validationErrors.push(manualAddressValidationType.InvalidLength.Premise);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate address line 1
 * @param addressLine1
 * @param manualAddressValidationType
 * @param validationErrors
 */

export const validateAddressLine1 = (addressLine1: string, manualAddressValidationType: ManualAddressValidationType, validationErrors: ValidationError[]): ValidationError[] => {
	const regex = REGEX_FOR_VALID_CHARACTERS;
	const match = regex.exec(addressLine1);
	if (!match) {
		validationErrors.push(manualAddressValidationType.InvalidCharacters.AddressLine1);
		return validationErrors;
	}

	if(addressLine1.length > ALLOWED_LENGTH) {
		validationErrors.push(manualAddressValidationType.InvalidLength.AddressLine1);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate address line 2
 * @param addressLine2
 * @param manualAddressValidationType
 * @param validationErrors
 */
export const validateAddressLine2 = (addressLine2: string, manualAddressValidationType: ManualAddressValidationType, validationErrors: ValidationError[]): ValidationError[] => {
	const regex = REGEX_FOR_VALID_CHARACTERS;
	const match = regex.exec(addressLine2);
	if (!match) {
		validationErrors.push(manualAddressValidationType.InvalidCharacters.AddressLine2);
		return validationErrors;
	}

	if(addressLine2.length > ALLOWED_LENGTH) {
		validationErrors.push(manualAddressValidationType.InvalidLength.AddressLine2);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate city
 * @param city
 * @param manualAddressValidationType
 * @param validationErrors
 */

export const validateCity = (city: string, manualAddressValidationType: ManualAddressValidationType, validationErrors: ValidationError[]): ValidationError[] => {
	const regex = REGEX_FOR_VALID_CHARACTERS;
	const match = regex.exec(city);
	if (!match) {
		validationErrors.push(manualAddressValidationType.InvalidCharacters.City);
		return validationErrors;
	}

	if(city.length > ALLOWED_LENGTH) {
		validationErrors.push(manualAddressValidationType.InvalidLength.City);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate county, town, province, region
 * @param county
 * @param manualAddressValidationType
 * @param validationErrors
 */
export const validateCounty = (county: string, manualAddressValidationType: ManualAddressValidationType, validationErrors: ValidationError[]): ValidationError[] => {
	const regex = REGEX_FOR_VALID_CHARACTERS;
	const match = regex.exec(county);
	if (!match) {
		validationErrors.push(manualAddressValidationType.InvalidCharacters.County);
		return validationErrors;
	}

	if(county.length > ALLOWED_LENGTH) {
		validationErrors.push(manualAddressValidationType.InvalidLength.County);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate postcode, mandatory if UK country provided.
 * @param postcode
 * @param country
 * @param manualAddressValidationType
 * @param validationErrors
 */
export const validatePostcode = (postcode: string, country: string, manualAddressValidationType: ManualAddressValidationType, validationErrors: ValidationError[]): ValidationError[] => {
	const regex = REGEX_FOR_VALID_CHARACTERS;
	const match = regex.exec(postcode);
	if(!match) {
		validationErrors.push(manualAddressValidationType.InvalidCharacters.Postcode);
		return validationErrors;
	}

	if(postcode.length > POSTCODE_ALLOWED_LENGTH) {
		validationErrors.push(manualAddressValidationType.InvalidLength.Postcode);
		return validationErrors;
	}

	if(country && UK_COUNTRY_LIST.includes(country) && !postcode.match(REGEX_FOR_VALID_UK_POSTCODE)) {
		validationErrors.push(manualAddressValidationType.InvalidValue.Postcode);
	}

	return validationErrors;
}

/**
 * Validate country
 * @param country
 * @param manualAddressValidationType
 * @param validationErrors
 */
export const validateCountry = (country: string, manualAddressValidationType: ManualAddressValidationType, validationErrors: ValidationError[]): ValidationError[] => {
	if(!COUNTRY_LIST.includes(country)) {
		validationErrors.push(manualAddressValidationType.InvalidValue.Country);
	}

	return validationErrors;

}


export const validateCountryAndPostcode = (country: string, postcode: string, manualAddressValidationType: ManualAddressValidationType, validationErrors: ValidationError[]): ValidationError[] => {

	let isPostcodeMandatory = false;

	// Country
	if (!country) {
			validationErrors.push(manualAddressValidationType.MissingValue.Country);
			isPostcodeMandatory = true;
	} else if (UK_COUNTRY_LIST.includes(country)) {
			isPostcodeMandatory = true;
	}

	// Validate country after checking if it's in the UK_COUNTRY_LIST
	if (country) {
			validationErrors = validateCountry(country, manualAddressValidationType, validationErrors);
	}

	// Postcode
	if(!postcode && isPostcodeMandatory) {
		validationErrors.push(manualAddressValidationType.MissingValue.Postcode);
		return validationErrors;
	} else {
		validationErrors = validatePostcode(postcode, country, manualAddressValidationType, validationErrors);
	}

	return validationErrors;
}