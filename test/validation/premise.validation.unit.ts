import { validatePremise } from "../../src/validation/premise.validation";
import { PremiseValidation } from "../../src/validation/address.validation.config";
import { premisesErrorMessageKey } from "../../src/utils/api.enumerations.keys";
import { ValidationError } from "../../src/model/validation.model";

describe("Input validation test", () => {
    test("should return validation errors if fields have invalid characters", () => {
        let validationErrors: ValidationError[] = [];
        const jsvalidationErrors = validatePremise("ゃ", PremiseValidation, validationErrors);
        if (validationErrors) {
            expect(jsvalidationErrors).toHaveLength(1);
            expect(jsvalidationErrors[0].messageKey).toEqual(premisesErrorMessageKey.PREMISES_CHARACTERS);
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return validation error if field has lengthy value", () => {
        let validationErrors: ValidationError[] = [];
        const jsvalidationErrors = validatePremise("HBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVI", 
                                            PremiseValidation, validationErrors);
        if (validationErrors) {
            expect(jsvalidationErrors).toHaveLength(1);
            expect(jsvalidationErrors[0].messageKey).toEqual(premisesErrorMessageKey.PREMISES_LENGTH);
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return one validation error - order and priority of error test ", () => {
        let validationErrors: ValidationError[] = [];
        const jsvalidationErrors = validatePremise("ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ", 
        PremiseValidation, validationErrors);
        if (jsvalidationErrors) {
            expect(jsvalidationErrors).toHaveLength(1);
            expect(jsvalidationErrors[0].messageKey).toEqual(premisesErrorMessageKey.PREMISES_CHARACTERS);
        } else {
            fail("Expected validation not raised");
        }
    });
});