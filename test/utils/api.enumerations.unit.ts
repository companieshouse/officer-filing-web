const READABLE_COMPANY_STATUS = "Receiver Action";
const READABLE_COMPANY_TYPE = "Private limited company";
const KEY_RECEIVERSHIP = "receivership";
const KEY_LTD = "ltd";
const KEY = "key";
const SIC_CODE_KEY = "00011";
const VALIDATION_API_MESSAGE = "<director-name> cannot be found";
const VALIDATION_WEB_MESSAGE = "Date <director-name> was removed must be today or in the past";
const VALIDATION_API_KEY = "director-not-found";
const VALIDATION_WEB_KEY = "removal-date-in-past";
const IDENTIFICATION_TYPE_KEY = "uk-limited-company";
const PSC_STATEMENT_DESCRIPTION = "Test psc-details-not-confirmed description";
const IDENTIFICATION_TYPE_DESCRIPTION = "UK Limited Company";

jest.mock("js-yaml", () => {
  return {
    load: jest.fn(() => {
      return {
        company_status: {
          [KEY_RECEIVERSHIP]: READABLE_COMPANY_STATUS,
        },
        company_type: {
          [KEY_LTD]: READABLE_COMPANY_TYPE,
        },
        validation: {
          [VALIDATION_API_KEY]: VALIDATION_API_MESSAGE
        },
        validation_web: {
          [VALIDATION_WEB_KEY]: VALIDATION_WEB_MESSAGE
        },
      };
    }),
  };
});

import {
  lookupCompanyStatus,
  lookupCompanyType,
  lookupAPIValidationMessage,
  lookupWebValidationMessage,
  overwriteDirectorName,
  convertAPIMessageToKey
} from "../../src/utils/api.enumerations";

describe("api enumeration tests", () => {

  it("should return a readable company type description when given a company type key", () => {
    const readableCompanyType: string = lookupCompanyType(KEY_LTD);
    expect(readableCompanyType).toEqual(READABLE_COMPANY_TYPE);
  });

  it("should return original key when there is no match for the company type key", () => {
    const readableCompanyType: string = lookupCompanyType(KEY);
    expect(readableCompanyType).toEqual(KEY);
  });

  it("should return a readable company status description when given a company status key", () => {
    const readableCompanyStatus: string = lookupCompanyStatus(KEY_RECEIVERSHIP);
    expect(readableCompanyStatus).toEqual(READABLE_COMPANY_STATUS);
  });

  it("should return original key when there is no match for the company status key", () => {
    const readableCompanyStatus: string = lookupCompanyStatus(KEY);
    expect(readableCompanyStatus).toEqual(KEY);
  });

  it("should return a readable validation message error when given a validation key", () => {
    const readableValidationMessage: string = lookupAPIValidationMessage(VALIDATION_API_KEY);
    expect(readableValidationMessage).toEqual(VALIDATION_API_MESSAGE);
  });

  it("should return original validation key when there is no validation message to match", () => {
    const readableValidationMessage: string = lookupAPIValidationMessage(KEY);
    expect(readableValidationMessage).toEqual(KEY);
  });

  it("should return a readable validation message error when given a validation key", () => {
    const readableValidationMessage: string = lookupWebValidationMessage(VALIDATION_WEB_KEY);
    expect(readableValidationMessage).toEqual(VALIDATION_WEB_MESSAGE);
  });

  it("should return original validation key when there is no validation message to match", () => {
    const readableValidationMessage: string = lookupWebValidationMessage(KEY);
    expect(readableValidationMessage).toEqual(KEY);
  });

  it("should overwrite <director-name> in validation error message", () => {
    const readableValidationMessage: string = overwriteDirectorName(VALIDATION_WEB_MESSAGE, "John Doe");
    expect(readableValidationMessage).toEqual("Date John Doe was removed must be today or in the past");
  });

  it("should return original validation error message if there is tag to overwrite", () => {
    const readableValidationMessage: string = overwriteDirectorName("Testing the api-enumerations", "John Doe");
    expect(readableValidationMessage).toEqual("Testing the api-enumerations");
  });

  it("should return a validation key when there is a readable validation message error found", () => {
    const validationKey: string = convertAPIMessageToKey(VALIDATION_API_MESSAGE);
    expect(validationKey).toEqual(VALIDATION_API_KEY);
  });

  it("should return a validation key when there is a readable DYNAMIC validation message error found", () => {
    const validationMessage = "John Doe cannot be found";
    const validationKey: string = convertAPIMessageToKey(validationMessage);
    expect(validationKey).toEqual(VALIDATION_API_KEY);
  });

  it("should return original validation message when there is no validation key found", () => {
    const validationKey: string = convertAPIMessageToKey(VALIDATION_WEB_MESSAGE);
    expect(validationKey).toEqual(VALIDATION_WEB_MESSAGE);
  });

  it("should handle long input strings efficiently to avoid backtracking", () => {
    const longInput = "<tag>".repeat(10000) + "end";
    const start = Date.now();

    const validationKey = convertAPIMessageToKey(longInput);

    const duration = Date.now() - start;
    expect(validationKey).toEqual(longInput); // Should return the original message
    expect(duration).toBeLessThan(100); // Ensure the regex executes efficiently
  });
});
