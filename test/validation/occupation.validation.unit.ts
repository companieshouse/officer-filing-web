import { validateOccupation } from "../../src/validation/occupation.validation";
import { OccupationValidation } from "../../src/validation/occupation.validation.config";
import { occupationErrorMessageKey } from "../../src/utils/api.enumerations.keys";

describe("Input validation test", () => {
    test("should return validation errors if fields have invalid characters", () => {
        const jsvalidationError = validateOccupation("ゃ", OccupationValidation);
        if (jsvalidationError) {
            expect(jsvalidationError.messageKey).toEqual(occupationErrorMessageKey.OCCUPATION_CHARACTERS);
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return validation error if field has lengthy value", () => {
        const jsvalidationError = validateOccupation("HBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVIAEFAEFAEFFAAEFAEFAEFAEAEFAEFAEFAFAEFAFAEFAEFAEFAEFAEFAEFAEFAEFEAF", OccupationValidation);
        if (jsvalidationError) {
            expect(jsvalidationError.messageKey).toEqual(occupationErrorMessageKey.OCCUPATION_LENGTH);
        } else {
            fail("Expected validation not raised");
        }
    });

    test("should return one validation error - order and priority of error test ", () => {
        const jsvalidationError = validateOccupation("ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ", OccupationValidation);
        if (jsvalidationError) {
            expect(jsvalidationError.messageKey).toEqual(occupationErrorMessageKey.OCCUPATION_CHARACTERS);
        } else {
            fail("Expected validation not raised");
        }
    });
});