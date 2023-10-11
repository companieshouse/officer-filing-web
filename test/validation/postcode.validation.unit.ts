import { validatePremiseAndPostcode } from "../../src/validation/postcode.validation";
import { PostcodeValidation, PremiseValidation } from "../../src/validation/address.validation.config";
import { premisesErrorMessageKey, postcodeErrorMessageKey } from "../../src/utils/api.enumerations.keys";

describe("Input validation test", () => {
    test("should return a validation error if the postcode field is empty", () => {
        const validationErrors = validatePremiseAndPostcode("", PostcodeValidation, PremiseValidation, "");
        if (validationErrors) {
            expect(validationErrors).toHaveLength(1);
            expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_BLANK)
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return validation errors if fields have invalid characters", () => {
        const validationErrors = validatePremiseAndPostcode("%$£@", PostcodeValidation, PremiseValidation, "ゃ");
        if (validationErrors) {
            expect(validationErrors).toHaveLength(2);
            expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_CHARACTERS);
            expect(validationErrors[1].messageKey).toEqual(premisesErrorMessageKey.PREMISES_CHARACTERS);
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return validation error if field has lengthy value", () => {
        const validationErrors = validatePremiseAndPostcode("HBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAP", PostcodeValidation, PremiseValidation, "ゃ");
        if (validationErrors) {
            expect(validationErrors).toHaveLength(2);
            expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_LENGTH);
            expect(validationErrors[1].messageKey).toEqual(premisesErrorMessageKey.PREMISES_CHARACTERS);
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return validation errors for combination of errors", () => {
        const validationErrors = validatePremiseAndPostcode("HBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAP", PostcodeValidation, PremiseValidation,
          "11111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111");
        if (validationErrors) {
            expect(validationErrors).toHaveLength(2);
            expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_LENGTH);
            expect(validationErrors[1].messageKey).toEqual(premisesErrorMessageKey.PREMISES_LENGTH);
        } else {
            fail("Expected validation not raised");
        }
    });
});