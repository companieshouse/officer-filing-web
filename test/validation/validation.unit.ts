jest.mock("../../src/utils/api.enumerations");

import { ValidationError } from '../../src/model/validation.model';
import { lookupWebValidationMessage } from '../../src/utils/api.enumerations';
import { firstNameErrorMessageKey, titleErrorMessageKey } from '../../src/utils/api.enumerations.keys';
import { formatValidationErrors } from '../../src/validation/validation';

const mockLookupWebValidationMessage = lookupWebValidationMessage as jest.Mock;

describe("Format validation errors tests", () => {

    beforeEach(() => {
        mockLookupWebValidationMessage.mockClear();
    });

    test("Should not return any errors when no validation errors are provided", async () => {
        const errors = formatValidationErrors([]);

        expect(errors.errorList.length).toBe(0);
    });
    
    test("Should return an error when a validation error is provided", async () => {
        mockLookupWebValidationMessage.mockReturnValueOnce("webValidationMessage");
        const validationError: ValidationError = {
                messageKey: titleErrorMessageKey.TITLE_LENGTH,
                source: ["titleSource"],
                link: "titleLink"
        }
        const errors = formatValidationErrors([validationError]);

        expect(errors.errorList.length).toBe(1);
        expect(errors.errorList[0].href).toBe('#titleLink');
        expect(errors.errorList[0].text).toBe("webValidationMessage");
    });

    test("Should return multiple errors when multiple validation errors are provided", async () => {
        mockLookupWebValidationMessage.mockReturnValue("webValidationMessage");
        const validationError1: ValidationError = {
                messageKey: titleErrorMessageKey.TITLE_LENGTH,
                source: ["titleSource1"],
                link: "titleLink1"
        }
        const validationError2: ValidationError = {
            messageKey: firstNameErrorMessageKey.FIRST_NAME_CHARACTERS,
            source: ["titleSource2"],
            link: "titleLink2"
        }
        const errors = formatValidationErrors([validationError1, validationError2]);

        expect(errors.errorList.length).toBe(2);
        expect(errors.errorList[0].href).toBe('#titleLink1');
        expect(errors.errorList[0].text).toBe("webValidationMessage");
        expect(errors.errorList[1].href).toBe('#titleLink2');
        expect(errors.errorList[1].text).toBe("webValidationMessage");
    });

});
