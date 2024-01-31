jest.mock("../../src/utils/feature.flag");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/validation.status.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
  urlParams
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { createMockValidationStatusError, mockValidValidationStatusResponse, mockValidationStatusError } from "../mocks/validation.status.response.mock";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { buildValidationErrors } from "../../src/controllers/director.residential.address.manual.controller";
import {
  correspondenceAddressCountryErrorMessageKey,
  residentialAddressAddressLineOneErrorMessageKey,
  residentialAddressAddressLineTwoErrorMessageKey,
  residentialAddressCountryErrorMessageKey,
  residentialAddressLocalityErrorMessageKey,
  residentialAddressPostcodeErrorMessageKey,
  residentialAddressPremisesErrorMessageKey,
  residentialAddressRegionErrorMessageKey
} from "../../src/utils/api.enumerations.keys";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Enter the director&#39;s home address";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const validData = {
  "residential_address_premises": "The Big House",
  "residential_address_line_1": "One Street",
  "residential_address_line_2": "Two",
  "residential_address_city": "Three",
  "residential_address_county": "Four",
  "typeahead_input_0": "France",
  "residential_address_postcode": "TE6 3ST"
}

const invalidData = {
  "residential_address_premises": "The Big Houseゃ",
  "residential_address_line_1": "One Street",
  "residential_address_line_2": "Twoゃ",
  "residential_address_city": "Three",
  "residential_address_county": "Fourゃ",
  "typeahead_input_0": "England",
  "residential_address_postcode": "ゃ"
}

describe("Director residential address manual controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.mockSessionMiddleware.mockClear();
    mockGetValidationStatus.mockReset();
  });
  
    describe("get tests", () => {
  
      it("Should navigate to director residential address manual page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({});

        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should populate filing data on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          residentialAddress: {
            premises: "The Big House",
            addressLine1: "One Street",
            addressLine2: "Two",
            locality: "Three",
            region: "Four",
            country: "Five",
            postalCode: "TE6 3ST"
          }
        });

        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain("The Big House");
        expect(response.text).toContain("One Street");
        expect(response.text).toContain("Two");
        expect(response.text).toContain("Three");
        expect(response.text).toContain("Four");
        expect(response.text).toContain("Five");
        expect(response.text).toContain("TE6 3ST");
      });

      it("Should navigate to error page when get officer filing throws an error", async () => {
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));

        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should populate the back link with confirm page URL if the request contains a query param and disregard the residentialManualAddressBackLink if provided", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          residentialAddress: {
            premises: "The Big House",
            addressLine1: "One Street",
            addressLine2: "Two",
            locality: "Three",
            region: "Four",
            country: "Five",
            postalCode: "TE6 3ST"
          },
          residentialManualAddressBackLink: "array-page"
        });

        const response = await request(app).get(`${PAGE_URL}?backLink=confirm-residential-address`);

        expect(response.text).toContain(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END);
        expect(response.text).not.toContain("array-page");
      });

      it("Should populate back link with lookup page URL if the filing does not contain residentialManualAddressBackLink", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          residentialAddress: {
            premises: "The Big House",
            addressLine1: "One Street",
            addressLine2: "Two",
            locality: "Three",
            region: "Four",
            country: "Five",
            postalCode: "TE6 3ST"
          },
        });

        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END);
      });

    });

    describe("post tests", () => {

      describe("JS validation tests for residential addresses", () => {

        it("Should render validation error with null values passed as residential address", async () => {
          mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
          mockGetOfficerFiling.mockResolvedValueOnce({
            data: {
              firstName: "John",
              lastName: "Smith"
            }
          });

          const response = await request(app).post(PAGE_URL).send({});

          expect(response.text).toContain("Enter a property name or number");
          expect(response.text).toContain("Enter an address");
          expect(response.text).toContain("Enter a city or town");
          expect(response.text).toContain("Enter a country");

          expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
          expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        });

        it("Should render other validation errors when passing in invalid data as residential address", async () => {
          mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
          mockGetOfficerFiling.mockResolvedValueOnce({
            data: {
              firstName: "John",
              lastName: "Smith"
            }
          });

          const response = await request(app).post(PAGE_URL).send(invalidData);

          expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("Address line 2 must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("County, state, province or region must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("Postcode or ZIP must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");

          expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
        });


      });

      it("Should patch officer filing with updated information", async () => {
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith"
          }
        });
        const response = await request(app).post(PAGE_URL).send(validData);

        expect(mockPatchOfficerFiling).toBeCalledWith(
          expect.objectContaining({}),
          TRANSACTION_ID,
          SUBMISSION_ID,
          expect.objectContaining({
            residentialAddress: {
              premises: "The Big House",
              addressLine1: "One Street",
              addressLine2: "Two",
              locality: "Three",
              region: "Four",
              country: "France",
              postalCode: "TE6 3ST"
            }
          })
        );
      });

      it("Should redirect to error page when patch officer filing throws an error", async () => {
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockPatchOfficerFiling.mockRejectedValueOnce(new Error("Error patching officer filing"));

        const response = await request(app).post(PAGE_URL).send(validData);

        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should redirect to error page when get validation status throws an error", async () => {
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetValidationStatus.mockRejectedValueOnce(new Error("Error getting validation status"));

        const response = await request(app).post(PAGE_URL);

        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should display errors on page if get validation status returns errors", async () => {
        mockGetValidationStatus.mockResolvedValueOnce({
          errors: [createMockValidationStatusError("Enter a property name or number for the director's home address"), createMockValidationStatusError("Enter a city or town for the director's home address")],
          isValid: false
        });
        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith"
          }
        });

        const response = await request(app).post(PAGE_URL).send(validData);

        expect(response.text).toContain("Enter a property name or number");
        expect(response.text).toContain("Enter a city or town");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
      });

    });

    describe("buildValidationErrors tests", () => {

      it("should return premises validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Enter a property name or number for the director's home address")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(residentialAddressPremisesErrorMessageKey.RESIDENTIAL_ADDRESS_PREMISES_BLANK);
      });

      it("should return address line 1 validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Address line 1 for the director's home address must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(residentialAddressAddressLineOneErrorMessageKey.RESIDENTIAL_ADDRESS_ADDRESS_LINE_1_CHARACTERS);
      });

      it("should return address line 2 validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Address line 2 for the director's home address must be 50 characters or less")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(residentialAddressAddressLineTwoErrorMessageKey.RESIDENTIAL_ADDRESS_ADDRESS_LINE_2_LENGTH);
      });

      it("should return locality validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Enter a city or town for the director's home address")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(residentialAddressLocalityErrorMessageKey.RESIDENTIAL_ADDRESS_LOCALITY_BLANK);
      });

      it("should return region validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("County, state, province or region for the director's home address must be 50 characters or less")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(residentialAddressRegionErrorMessageKey.RESIDENTIAL_ADDRESS_REGION_LENGTH);
      });

      it("should return country validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Country for the director's home address must be 50 characters or less")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(residentialAddressCountryErrorMessageKey.RESIDENTIAL_ADDRESS_COUNTRY_LENGTH);
      });

      it("should return country validation error when invalid country", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Select a country from the list for the director's residential address")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(residentialAddressCountryErrorMessageKey.RESIDENTIAL_ADDRESS_COUNTRY_INVALID);
      });

      it("should return postcode validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Enter a postcode or ZIP for the director's home address")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(residentialAddressPostcodeErrorMessageKey.RESIDENTIAL_ADDRESS_POSTAL_CODE_BLANK);
      });

      it("should ignore unrelated validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusError],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors).toHaveLength(0);
      });
      
    });

});
