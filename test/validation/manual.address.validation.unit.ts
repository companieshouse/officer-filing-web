import {Address} from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import {validateManualAddress} from "../../src/validation/manual.address.validation";
import {CorrespondenceManualAddressValidation} from "../../src/validation/address.validation.config";


describe("Input validation tests", () => {

	//Generic cases
	test("Should return empty array when all fields are valid", () => {
		const serviceAddress : Address =  {
			premises: "86",
			addressLine1: "East Cowley Lane",
			addressLine2: "Some address line 2",
			locality: "Locality A",
			region: "Region B",
			country: "France",
			postalCode: "12345",
		}
		const jsValidationErrors = validateManualAddress(serviceAddress, CorrespondenceManualAddressValidation);

		expect(jsValidationErrors).toHaveLength(0);
	});

	test("Should populate array with validation errors when mandatory values are null", () => {
		const serviceAddress : Address =  {
			premises: "",
			addressLine1: "",
			addressLine2: "",
			locality: "",
			region: "",
			country: "",
			postalCode: "",
		}
		const jsValidationErrors = validateManualAddress(serviceAddress, CorrespondenceManualAddressValidation);

		expect(jsValidationErrors).not.toBeNull();
		expect(jsValidationErrors).toHaveLength(4);
		expect(jsValidationErrors[0].messageKey).toEqual(CorrespondenceManualAddressValidation.MissingValue.Premise.messageKey);
		expect(jsValidationErrors[1].messageKey).toEqual(CorrespondenceManualAddressValidation.MissingValue.AddressLine1.messageKey);
		expect(jsValidationErrors[2].messageKey).toEqual(CorrespondenceManualAddressValidation.MissingValue.City.messageKey);
		expect(jsValidationErrors[3].messageKey).toEqual(CorrespondenceManualAddressValidation.MissingValue.Country.messageKey);
	});

	test("Should populate array with validation errors when fields contain invalid characters", () => {
		const serviceAddress : Address =  {
			premises: "ゃ",
			addressLine1: "ゃ",
			addressLine2: "ゃ",
			locality: "ゃ",
			region: "ゃ",
			country: "ゃ",
			postalCode: "ゃ",
		}
		const jsValidationErrors = validateManualAddress(serviceAddress, CorrespondenceManualAddressValidation);

		expect(jsValidationErrors).not.toBeNull();
		expect(jsValidationErrors).toHaveLength(7);
		expect(jsValidationErrors[0].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.Premise.messageKey);
		expect(jsValidationErrors[1].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.AddressLine1.messageKey);
		expect(jsValidationErrors[2].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.AddressLine2.messageKey);
		expect(jsValidationErrors[3].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.City.messageKey);
		expect(jsValidationErrors[4].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.County.messageKey);
		expect(jsValidationErrors[5].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidValue.Country.messageKey);
		expect(jsValidationErrors[6].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.Postcode.messageKey);
	});

	test("Should populate array with validation errors when fields contain invalid length", () => {
		const serviceAddress : Address =  {
			premises: "86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane86 East Cowley Lane",
			addressLine1: "Address Line 1 Address Line 1 Address Line 1 Address Line 1 Address Line 1 Address Line 1 Address Line 1 Address Line 1 Address Line 1 Address Line 1",
			addressLine2: "Address Line 2 Address Line 2 Address Line 2 Address Line 2 Address Line 2 Address Line 2 Address Line 2 Address Line 2 Address Line 2 Address Line 2",
			locality: "Some locality at Some locality at Some locality at Some locality at Some locality at Some locality at Some locality at Some locality at Some locality at ",
			region: "Some region at Some region at Some region at Some region at Some region at Some region at Some region at Some region at Some region at Some region at Some region at ",
			country: "Country that is not in the list",
			postalCode: "Some very long postcode Some very long postcode Some very long postcode Some very long postcode Some very long postcode Some very long postcode Some very long postcode Some very long postcode ",
		}
		const jsValidationErrors = validateManualAddress(serviceAddress, CorrespondenceManualAddressValidation);

		expect(jsValidationErrors).not.toBeNull();
		expect(jsValidationErrors).toHaveLength(7);
		expect(jsValidationErrors[0].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidLength.Premise.messageKey);
		expect(jsValidationErrors[1].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidLength.AddressLine1.messageKey);
		expect(jsValidationErrors[2].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidLength.AddressLine2.messageKey);
		expect(jsValidationErrors[3].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidLength.City.messageKey);
		expect(jsValidationErrors[4].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidLength.County.messageKey);
		expect(jsValidationErrors[5].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidValue.Country.messageKey);
		expect(jsValidationErrors[6].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidLength.Postcode.messageKey);
	});

	test("Should respect validation errors with priority of the validation error.  ", () => {
		const serviceAddress : Address =  {
			premises: "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ",
			addressLine1: "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ",
			addressLine2: "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ",
			locality: "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ",
			region: "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ ",
			country: "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ",
			postalCode: "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ",
		}
		const jsValidationErrors = validateManualAddress(serviceAddress, CorrespondenceManualAddressValidation);

		expect(jsValidationErrors).not.toBeNull();
		expect(jsValidationErrors).toHaveLength(7);
		expect(jsValidationErrors[0].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.Premise.messageKey);
		expect(jsValidationErrors[1].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.AddressLine1.messageKey);
		expect(jsValidationErrors[2].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.AddressLine2.messageKey);
		expect(jsValidationErrors[3].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.City.messageKey);
		expect(jsValidationErrors[4].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.County.messageKey);
		expect(jsValidationErrors[5].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidValue.Country.messageKey);
		expect(jsValidationErrors[6].messageKey).toEqual(CorrespondenceManualAddressValidation.InvalidCharacters.Postcode.messageKey);
	});

	//Special cases
	test("Should populate array with validation if UK country but postcode is null", () => {
		const serviceAddress : Address =  {
			premises: "86",
			addressLine1: "East Cowley Lane",
			addressLine2: "Some address line 2",
			locality: "Locality A",
			region: "Region B",
			country: "England",
			postalCode: "",
		}
		const jsValidationErrors = validateManualAddress(serviceAddress, CorrespondenceManualAddressValidation);
		expect(jsValidationErrors).not.toBeNull();
		expect(jsValidationErrors).toHaveLength(1);
		expect(jsValidationErrors[0].messageKey).toEqual(CorrespondenceManualAddressValidation.MissingValue.Postcode.messageKey);
	});

	test("Should NOT populate array with validation if non UK country and postcode is null", () => {
		const serviceAddress : Address =  {
			premises: "86",
			addressLine1: "East Cowley Lane",
			addressLine2: "Some address line 2",
			locality: "Locality A",
			region: "Region B",
			country: "France",
			postalCode: "",
		}
		const jsValidationErrors = validateManualAddress(serviceAddress, CorrespondenceManualAddressValidation);
		expect(jsValidationErrors).toHaveLength(0);
	});

});