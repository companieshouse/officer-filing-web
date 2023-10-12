
jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/api.service");
jest.mock("../../src/services/postcode.lookup.service");
jest.mock("../../src/utils/logger");


import { validateUKPostcode } from "../../src/validation/uk.postcode.validation";
import { ValidationError } from "../../src/model/validation.model";
import { PostcodeValidation } from "../../src/validation/address.validation.config";
import { getIsValidUKPostcode } from "../../src/services/postcode.lookup.service";
import { postcodeErrorMessageKey } from "../../src/utils/api.enumerations.keys";


const mockIsValidUKPostcode: jest.Mock = getIsValidUKPostcode as jest.Mock;

describe("validateUKPostcode test", () => {

  it("should return empty array of validation Errors when postcode is valid", async () => {
    let validationErrors: ValidationError[] = [];
    mockIsValidUKPostcode.mockReturnValue(true);
    validationErrors = await validateUKPostcode("http://example-postcode-lookup/postcode", "SWA11AA", PostcodeValidation, validationErrors);
    expect(validationErrors).toEqual([]);
  });


  it("should array of validation errors when postcode is invalid", async () => {
    let validationErrors: ValidationError[] = [];
    mockIsValidUKPostcode.mockReturnValue(false);
    validationErrors = await validateUKPostcode("http://example-postcode-lookup/postcode", "SWA11XY", PostcodeValidation, validationErrors);
    expect(validationErrors.length).toEqual(1);
    expect(validationErrors[0].messageKey).toEqual(postcodeErrorMessageKey.POSTCODE_INVALID);
  });
});
