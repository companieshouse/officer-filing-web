import { validatePostcode } from "../../src/validation/postcode.validation";
import { PostcodeValidation } from "../../src/validation/address.validation.config";
import { postcodeErrorMessageKey } from "../../src/utils/api.enumerations.keys";

describe("Input validation test", () => {
    test("should return a validation error if the postcode field is empty", () => {
        const validationErrors = validatePostcode("", PostcodeValidation);
        if (validationErrors) {
            expect(validationErrors).toHaveLength(1);
            expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_BLANK)
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return validation errors if fields have invalid characters", () => {
        const validationErrors = validatePostcode("%$£@", PostcodeValidation);
        if (validationErrors) {
            expect(validationErrors).toHaveLength(1);
            expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_CHARACTERS);
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return validation error if field has lengthy value", () => {
        const validationErrors = validatePostcode("HBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAP", PostcodeValidation);
        if (validationErrors) {
            expect(validationErrors).toHaveLength(1);
            expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_LENGTH);
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return only one validation error - order and priority test ", () => {
        const validationErrors = validatePostcode("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", PostcodeValidation);
        if (validationErrors) {
            expect(validationErrors).toHaveLength(1);
            expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_CHARACTERS);
        } else {
            fail("Expected validation not raised");
        }
    });

    
});