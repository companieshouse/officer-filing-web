jest.mock("../../../src/utils/feature.flag");
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/validation.status.service");
jest.mock("../../../src/services/company.appointments.service");
jest.mock("../../../src/utils/address");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END,
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END,
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END,
  urlParams
} from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { createMockValidationStatusError, mockValidValidationStatusResponse, mockValidationStatusError } from "../../mocks/validation.status.response.mock";
import { getValidationStatus } from "../../../src/services/validation.status.service";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { buildValidationErrors } from "../../../src/controllers/shared.controllers/director.correspondence.address.manual.controller";
import {
  correspondenceAddressAddressLineOneErrorMessageKey,
  correspondenceAddressAddressLineTwoErrorMessageKey,
  correspondenceAddressCountryErrorMessageKey,
  correspondenceAddressLocalityErrorMessageKey,
  correspondenceAddressPostcodeErrorMessageKey,
  correspondenceAddressPremisesErrorMessageKey,
  correspondenceAddressRegionErrorMessageKey
} from "../../../src/utils/api.enumerations.keys";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { compareAddress } from "../../../src/utils/address";
import { validCompanyAppointmentResource } from "../../mocks/company.appointment.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointmentResource.resource);
const mockCompareAddress = compareAddress as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Enter the director&#39;s correspondence address";
const PAGE_HEADING_WELSH = "Cofnodwch gyfeiriad gohebiaeth y cyfarwyddwr";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const PAGE_URL_WELSH = PAGE_URL + "?lang=cy";
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL_WELSH = UPDATE_PAGE_URL + "?lang=cy";
const NEXT_PAGE_URL = DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL_WELSH = NEXT_PAGE_URL + "?lang=cy";
const UPDATE_NEXT_PAGE_URL = UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_NEXT_PAGE_URL_WELSH = UPDATE_NEXT_PAGE_URL + "?lang=cy";

const validData = {
  "correspondence_address_premises": "The Big House",
  "correspondence_address_line_1": "One Street",
  "correspondence_address_line_2": "Two",
  "correspondence_address_city": "Three",
  "correspondence_address_county": "Four",
  "typeahead_input_0": "France",
  "correspondence_address_postcode": "TE6 3ST"
}

const invalidData = {
  "correspondence_address_premises": "The Big Houseゃ",
  "correspondence_address_line_1": "One Street",
  "correspondence_address_line_2": "Twoゃ",
  "correspondence_address_city": "Three",
  "correspondence_address_county": "Fourゃ",
  "typeahead_input_0": "England",
  "correspondence_address_postcode": "ゃ"
}

describe("Director correspondence address controller tests", () => {

    beforeEach(() => {
      jest.clearAllMocks();
      mocks.mockSessionMiddleware.mockClear();
      mockGetValidationStatus.mockReset();
      mockPatchOfficerFiling.mockReset();
      mockGetCompanyAppointmentFullRecord.mockClear();
      mockGetOfficerFiling.mockReset();
      mockCompareAddress.mockClear();
    });

   describe("get tests", () => {
  
      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should navigate to director correspondence address manual page", async (url) => {
        mockGetOfficerFiling.mockResolvedValue({});

        const response = await request(app).get(url);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should navigate to error page when feature flag is off", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should populate filing data on the page", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            premises: "The Big House",
            addressLine1: "One Street",
            addressLine2: "Two",
            locality: "Three",
            region: "Four",
            country: "Five",
            postalCode: "TE6 3ST"
          }
        });

        const response = await request(app).get(url);
  
        expect(response.text).toContain("The Big House");
        expect(response.text).toContain("One Street");
        expect(response.text).toContain("Two");
        expect(response.text).toContain("Three");
        expect(response.text).toContain("Four");
        expect(response.text).toContain("Five");
        expect(response.text).toContain("TE6 3ST");
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should navigate to error page when get officer filing throws an error", async (url) => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));

        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[PAGE_URL, DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END],[UPDATE_PAGE_URL, UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END]])("Should populate the back link with confirm page URL if the request contains a query param and disregard the correspondenceManualAddressBackLink if provided", async (url, backLinkUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            premises: "The Big House",
            addressLine1: "One Street",
            addressLine2: "Two",
            locality: "Three",
            region: "Four",
            country: "Five",
            postalCode: "TE6 3ST"
          },
          serviceManualAddressBackLink: "array-page"
        });

        const response = await request(app).get(`${url}?backLink=confirm-correspondence-address`);

        expect(response.text).toContain(backLinkUrl);
        expect(response.text).not.toContain("array-page");
      });

      it.each([[PAGE_URL, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END],[UPDATE_PAGE_URL, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END]])("Should populate the back link with lookup page URL if the filing does not contain correspondenceManualAddressBackLink", async (url, backLinkUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            premises: "The Big House",
            addressLine1: "One Street",
            addressLine2: "Two",
            locality: "Three",
            region: "Four",
            country: "Five",
            postalCode: "TE6 3ST"
          },
        });
        
        const response = await request(app).get(url);

        expect(response.text).toContain(backLinkUrl);
      });

    });

    describe("post tests", () => {

      describe("JS validation tests", () => {

        it.each([[PAGE_URL], [UPDATE_PAGE_URL]])("Should render validation error with null values passed", async (url) => {
          mockGetValidationStatus.mockResolvedValue(mockValidValidationStatusResponse);
          mockGetOfficerFiling.mockResolvedValue({
            data: {
              firstName: "John",
              lastName: "Smith",
            }
          });

          const response = await request(app).post(url).send({});

          expect(response.text).toContain("Enter a property name or number");
          expect(response.text).toContain("Enter an address");
          expect(response.text).toContain("Enter a city or town");
          expect(response.text).toContain("Enter a country");

          expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
          expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        });

        it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should render other validation errors", async (url) => {
          mockGetValidationStatus.mockResolvedValue(mockValidValidationStatusResponse);
          mockGetOfficerFiling.mockResolvedValueOnce({
            data: {
              firstName: "John",
              lastName: "Smith",
            }
          });

          const response = await request(app).post(url).send(invalidData);

          expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("Address line 2 must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("County, state, province or region must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("Postcode or ZIP must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");

          expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
        });
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should redirect to error page when patch officer filing throws an error", async (url) => {
        mockPatchOfficerFiling.mockRejectedValue(new Error("Error patching officer filing"));
        mockGetOfficerFiling.mockRejectedValue({});

        const response = await request(app).post(url).send(validData);

        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should redirect to error page when get validation status throws an error", async (url) => {
        mockGetValidationStatus.mockRejectedValueOnce(new Error("Error getting validation status"));

        const response = await request(app).post(url).send(validData);

        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should display errors on page if get validation status returns errors", async (url) => {
        mockGetValidationStatus.mockResolvedValue({
          errors: [createMockValidationStatusError("Enter a property name or number for the director's correspondence address"), createMockValidationStatusError("Enter a city or town for the director's correspondence address")],
          isValid: false
        });
        mockGetOfficerFiling.mockResolvedValue({referenceAppointmentId: "ref_id",});
        mockPatchOfficerFiling.mockResolvedValue({
          data: {
            firstName: "John",
            lastName: "Smith"
          }
        });

        const response = await request(app).post(url).send(validData);

        expect(response.text).toContain("Enter a property name or number");
        expect(response.text).toContain("Enter a city or town");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
      });

      it.each([[PAGE_URL, NEXT_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL], [PAGE_URL_WELSH, NEXT_PAGE_URL_WELSH],[UPDATE_PAGE_URL_WELSH, UPDATE_NEXT_PAGE_URL_WELSH]])
      ("Should patch officer filing with updated information", async (url, nextPageUrl) => {
        mockGetValidationStatus.mockResolvedValue(mockValidValidationStatusResponse);
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "ref_id",
          serviceAddress: {
            premises: "The Big House",
            addressLine1: "One Street",
            addressLine2: "Two",
            locality: "Three",
            region: "Four",
            country: "Five",
            postalCode: "TE6 3ST"
          },
          isServiceAddressSameAsRegisteredOfficeAddress: false
        });
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          serviceAddress: {
            premises: "The Small House",
            addressLine1: "Two Street",
            addressLine2: "One",
            locality: "Four",
            region: "Five",
            country: "Six",
            postalCode: "TE7 3SU"
          },
          serviceAddressIsSameAsRegisteredOfficeAddress: false
        });
        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith"
          }
        });
        mockCompareAddress.mockReturnValue(false);

        const response = await request(app).post(url).send(validData);

        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toBeCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({
              serviceAddress: {
                premises: "The Big House",
                addressLine1: "One Street",
                addressLine2: "Two",
                locality: "Three",
                region: "Four",
                country: "France",
                postalCode: "TE6 3ST",
              },
              correspondenceAddressHasBeenUpdated: true
            })
          )
        } else {
          expect(mockPatchOfficerFiling).toBeCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({
              serviceAddress: {
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
        };

        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
      });
    })

    describe("buildValidationErrors tests", () => {

      it("should return premises validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Enter a property name or number for the director's correspondence address")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(correspondenceAddressPremisesErrorMessageKey.CORRESPONDENCE_ADDRESS_PREMISES_BLANK);
      });

      it("should return address line 1 validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Address line 1 for the director's correspondence address must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(correspondenceAddressAddressLineOneErrorMessageKey.CORRESPONDENCE_ADDRESS_ADDRESS_LINE_1_CHARACTERS);
      });

      it("should return address line 2 validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Address line 2 for the director's correspondence address must be 50 characters or less")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(correspondenceAddressAddressLineTwoErrorMessageKey.CORRESPONDENCE_ADDRESS_ADDRESS_LINE_2_LENGTH);
      });

      it("should return locality validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Enter a city or town for the director's correspondence address")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(correspondenceAddressLocalityErrorMessageKey.CORRESPONDENCE_ADDRESS_LOCALITY_BLANK);
      });

      it("should return region validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("County, state, province or region for the director's correspondence address must be 50 characters or less")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(correspondenceAddressRegionErrorMessageKey.CORRESPONDENCE_ADDRESS_REGION_LENGTH);
      });

      it("should return country validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Country for the director's correspondence address must be 50 characters or less")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(correspondenceAddressCountryErrorMessageKey.CORRESPONDENCE_ADDRESS_COUNTRY_LENGTH);
      });

      it("should return country validation error when invalid country", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Select a country from the list for the director's correspondence address")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(correspondenceAddressCountryErrorMessageKey.CORRESPONDENCE_ADDRESS_COUNTRY_INVALID);
      });

      it("should return postcode validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [createMockValidationStatusError("Enter a postcode or ZIP for the director's correspondence address")],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(correspondenceAddressPostcodeErrorMessageKey.CORRESPONDENCE_ADDRESS_POSTAL_CODE_BLANK);
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

    describe("Welsh language tests", () => {

      //get test
      it.each([[PAGE_URL_WELSH, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END + "?lang=cy"],[UPDATE_PAGE_URL_WELSH, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END + "?lang=cy"]])
      ("Should navigate to director correspondence address manual page in welsh with backlink containing lang param.", async (url, backLinkUrl) => {
        mockGetOfficerFiling.mockResolvedValue({});

        const response = await request(app).get(url);

        expect(response.text).toContain(PAGE_HEADING_WELSH);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain(backLinkUrl);
      });

      //post test
      it.each([[PAGE_URL_WELSH], [UPDATE_PAGE_URL_WELSH]])
      ("Should render validation error in welsh with null values passed", async (url) => {
        mockGetValidationStatus.mockResolvedValue(mockValidValidationStatusResponse);
        mockGetOfficerFiling.mockResolvedValue({
          data: {
            firstName: "John",
            lastName: "Smith",
          }
        });

        const response = await request(app).post(url).send({});

        expect(response.text).toContain("to be translated");
      });
    });
});
