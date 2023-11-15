import {Address} from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import {ManualAddressValidationType, ValidationError} from "../model/validation.model";
import {COUNTRY_LIST, UK_COUNTRY_LIST} from "../utils/properties";

const REGEX_FOR_MANUAL_ADDRESS = "^[-,.:; 0-9A-Z&@$£¥€'\"«»?!/\\\\()\\[\\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zſƒǺàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$";
const PREMISE_ALLOWED_LENGTH = 200;
const ALLOWED_LENGTH = 50;

export const validateManualAddress = (serviceAddress: Address,
																			correspondenceAddressValidationType: ManualAddressValidationType): ValidationError[] => {
	let validationErrors: ValidationError[] = [];

	// Premises
	if(!serviceAddress.premises) {
		validationErrors.push(correspondenceAddressValidationType.MissingValue.Premise);
	} else {
		validationErrors = validatePremise(serviceAddress.premises, correspondenceAddressValidationType, validationErrors);
	}

	// Address Line 1
	if(!serviceAddress.addressLine1) {
		validationErrors.push(correspondenceAddressValidationType.MissingValue.AddressLine1);
	} else {
		validationErrors = validateAddressLine1(serviceAddress.addressLine1, correspondenceAddressValidationType, validationErrors);
	}

	// Address Line 2
	if(serviceAddress.addressLine2) {
		validationErrors = validateAddressLine2(serviceAddress.addressLine2, correspondenceAddressValidationType, validationErrors);
	}

	// City
	if(!serviceAddress.locality) {
		validationErrors.push(correspondenceAddressValidationType.MissingValue.City);
	} else {
		validationErrors = validateCity(serviceAddress.locality, correspondenceAddressValidationType, validationErrors);
	}

	// County, Town, Province, Region
	if(serviceAddress.region) {
		validationErrors = validateCounty(serviceAddress.region, correspondenceAddressValidationType, validationErrors);
	}

	// Country
	if(!serviceAddress.country) {
		validationErrors.push(correspondenceAddressValidationType.MissingValue.Country);
	} else {
		validationErrors = validateCountry(serviceAddress.country, correspondenceAddressValidationType, validationErrors);
	}

	// Postcode
	if(serviceAddress.postalCode) {
		validationErrors = validatePostcode(serviceAddress.postalCode, serviceAddress.country, correspondenceAddressValidationType, validationErrors);
	}

	return validationErrors;
}

/**
 * Validate premise
 * @param premise
 * @param correspondenceAddressValidationType
 * @param validationErrors
 */
export const validatePremise = (premise: string,
																correspondenceAddressValidationType: ManualAddressValidationType,
																validationErrors: ValidationError[]): ValidationError[] => {
	if(!premise.match(REGEX_FOR_MANUAL_ADDRESS)) {
		validationErrors.push(correspondenceAddressValidationType.InvalidCharacters.Premise);
		return validationErrors;
	}

	if(premise.length > PREMISE_ALLOWED_LENGTH) {
		validationErrors.push(correspondenceAddressValidationType.InvalidLength.Premise);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate address line 1
 * @param addressLine1
 * @param correspondenceAddressValidationType
 * @param validationErrors
 */

export const validateAddressLine1 = (addressLine1: string,
																		 correspondenceAddressValidationType: ManualAddressValidationType,
																		 validationErrors: ValidationError[]): ValidationError[] => {
	if(!addressLine1.match(REGEX_FOR_MANUAL_ADDRESS)) {
		validationErrors.push(correspondenceAddressValidationType.InvalidCharacters.AddressLine1);
		return validationErrors;
	}

	if(addressLine1.length > ALLOWED_LENGTH) {
		validationErrors.push(correspondenceAddressValidationType.InvalidLength.AddressLine1);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate address line 2
 * @param addressLine2
 * @param correspondenceAddressValidationType
 * @param validationErrors
 */
export const validateAddressLine2 = (addressLine2: string,
																		 correspondenceAddressValidationType: ManualAddressValidationType,
																		 validationErrors: ValidationError[]): ValidationError[] => {
	if(!addressLine2.match(REGEX_FOR_MANUAL_ADDRESS)) {
		validationErrors.push(correspondenceAddressValidationType.InvalidCharacters.AddressLine2);
		return validationErrors;
	}

	if(addressLine2.length > ALLOWED_LENGTH) {
		validationErrors.push(correspondenceAddressValidationType.InvalidLength.AddressLine2);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate city
 * @param city
 * @param correspondenceAddressValidationType
 * @param validationErrors
 */

export const validateCity = (city: string,
														 correspondenceAddressValidationType: ManualAddressValidationType,
														 validationErrors: ValidationError[]): ValidationError[] => {
	if(!city.match(REGEX_FOR_MANUAL_ADDRESS)) {
		validationErrors.push(correspondenceAddressValidationType.InvalidCharacters.City);
		return validationErrors;
	}

	if(city.length > ALLOWED_LENGTH) {
		validationErrors.push(correspondenceAddressValidationType.InvalidLength.City);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate county, town, province, region
 * @param county
 * @param correspondenceAddressValidationType
 * @param validationErrors
 */
export const validateCounty = (county: string,
														 correspondenceAddressValidationType: ManualAddressValidationType,
														 validationErrors: ValidationError[]): ValidationError[] => {
	if(!county.match(REGEX_FOR_MANUAL_ADDRESS)) {
		validationErrors.push(correspondenceAddressValidationType.InvalidCharacters.County);
		return validationErrors;
	}

	if(county.length > ALLOWED_LENGTH) {
		validationErrors.push(correspondenceAddressValidationType.InvalidLength.County);
		return validationErrors;
	}

	return validationErrors;
}

/**
 * Validate postcode, mandatory if UK country provided.
 * @param postcode
 * @param country
 * @param correspondenceAddressValidationType
 * @param validationErrors
 */
export const validatePostcode = (postcode: string, country: string | undefined,
																 correspondenceAddressValidationType: ManualAddressValidationType,
																 validationErrors: ValidationError[]): ValidationError[] => {
	if(!postcode.match(REGEX_FOR_MANUAL_ADDRESS)) {
		validationErrors.push(correspondenceAddressValidationType.InvalidCharacters.Postcode);
		return validationErrors;
	}

	if(postcode.length > ALLOWED_LENGTH) {
		validationErrors.push(correspondenceAddressValidationType.InvalidLength.Postcode);
		return validationErrors;
	}

	if(country && UK_COUNTRY_LIST.includes(country) && !postcode.match(/^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/)) {
		validationErrors.push(correspondenceAddressValidationType.MissingValue.Postcode);
	}

	return validationErrors;
}

/**
 * Validate country
 * @param country
 * @param correspondenceAddressValidationType
 * @param validationErrors
 */
export const validateCountry = (country: string,
																correspondenceAddressValidationType: ManualAddressValidationType,
																validationErrors: ValidationError[]): ValidationError[] => {
	if(!COUNTRY_LIST.includes(country)) {
		validationErrors.push(correspondenceAddressValidationType.InvalidValue.Country);
		return validationErrors;
	}

	return validationErrors;

}