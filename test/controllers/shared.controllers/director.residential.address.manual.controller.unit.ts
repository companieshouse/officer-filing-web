jest.mock("../../../src/utils/feature.flag");
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/validation.status.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
  UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
  urlParams
} from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Enter the director&#39;s home address";
const PAGE_HEADING_WELSH = "Cofnodwch gyfeiriad cartref y cyfarwyddwr";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const APPOINT_PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const APPOINT_PAGE_URL_WELSH = APPOINT_PAGE_URL + "?lang=cy";
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL_WELSH = UPDATE_PAGE_URL + "?lang=cy";
const APPOINT_NEXT_PAGE_URL = DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const APPOINT_NEXT_PAGE_URL_WELSH = APPOINT_NEXT_PAGE_URL + "?lang=cy";
const UPDATE_NEXT_PAGE_URL = UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_NEXT_PAGE_URL_WELSH = UPDATE_NEXT_PAGE_URL + "?lang=cy";
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
    mocks.mockCreateSessionMiddleware.mockClear();
  });

  describe("get tests", () => {
  
      it.each([[APPOINT_PAGE_URL, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END], 
        [UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END, UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END]])
        ("Should navigate to '%s' page", async (url, backLink, confirmAddressPage) => {
        mockGetOfficerFiling.mockResolvedValueOnce({});

        const response = await request(app).get(url);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).not.toContain(confirmAddressPage);
        expect(response.text).toContain(backLink); expect(response.text).not.toContain(confirmAddressPage);
        expect(response.text).toContain(backLink);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])("Should navigate to error page when feature flag is off", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[APPOINT_PAGE_URL, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END], 
        [UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END, UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END]])
        ("Should populate filing data on the '%s' page", async (url, backLink, confirmAddressPage) => {
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

        const response = await request(app).get(url);
  
        expect(response.text).toContain("The Big House");
        expect(response.text).toContain("One Street");
        expect(response.text).toContain("Two");
        expect(response.text).toContain("Three");
        expect(response.text).toContain("Four");
        expect(response.text).toContain("Five");
        expect(response.text).toContain("TE6 3ST");
        expect(response.text).not.toContain(confirmAddressPage);
        expect(response.text).toContain(backLink);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])("Should navigate to error page when get officer filing throws an error", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(true);
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));

        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[APPOINT_PAGE_URL, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END], 
        [UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END, UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END]])
        ("Should populate the back link with confirm page URL if the request contains a query param and disregard the residentialManualAddressBackLink if provided", async (url, backLink, confirmAddressPage) => {
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

        const response = await request(app).get(`${url}?backLink=confirm-residential-address`);

        expect(response.text).not.toContain("array-page");
        expect(response.text).toContain(confirmAddressPage);
        expect(response.text).not.toContain(backLink);
      });

      it.each([[APPOINT_PAGE_URL, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END], 
        [UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END, UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END]])
        ("Should populate back link with lookup page URL if the filing does not contain residentialManualAddressBackLink", async (url, backLink, confirmAddressPage) => {
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

        const response = await request(app).get(url);

        expect(response.text).not.toContain(confirmAddressPage);
        expect(response.text).toContain(backLink);      
      });
  });

  describe("post tests", () => {
      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])("Should render validation error with null values passed as residential address", async (url) => {
          mockGetOfficerFiling.mockResolvedValueOnce({
            data: {
              firstName: "John",
              lastName: "Smith"
            }
          })
          const response = await request(app).post(url).send({});
          expect(response.text).toContain("Enter a property name or number");
          expect(response.text).toContain("Enter an address");
          expect(response.text).toContain("Enter a city or town");
          expect(response.text).toContain("Enter a country");
          expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
          expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])("Should render other validation errors when passing in invalid data as residential address", async (url) => {
          mockGetOfficerFiling.mockResolvedValueOnce({
            data: {
              firstName: "John",
              lastName: "Smith"
            }
          });

          const response = await request(app).post(url).send(invalidData);

          expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("Address line 2 must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("County, state, province or region must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
          expect(response.text).toContain("Postcode or ZIP must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");

          expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it.each([[APPOINT_PAGE_URL, APPOINT_NEXT_PAGE_URL], [UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL],
        [APPOINT_PAGE_URL_WELSH, APPOINT_NEXT_PAGE_URL_WELSH], [UPDATE_PAGE_URL_WELSH, UPDATE_NEXT_PAGE_URL_WELSH]])
      ("Should patch officer filing with filing information", async (url, nextPageUrl) => {
        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith"
          }
        });
        if (url === UPDATE_PAGE_URL || url === UPDATE_PAGE_URL_WELSH) {
          mockGetOfficerFiling.mockResolvedValueOnce({
            referenceAppointmentId: "123"
          });
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({ residentialAddressIsSameAsServiceAddress: true});
        }
    
        const response = await request(app).post(url).send(validData);

        if (url === UPDATE_PAGE_URL || url === UPDATE_PAGE_URL_WELSH) {
          expect(mockGetCompanyAppointmentFullRecord).toBeCalledWith(expect.any(Object), COMPANY_NUMBER, "123");
        } else {
          expect(mockGetCompanyAppointmentFullRecord).not.toBeCalled();
        }
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
        expect(response.text).toContain(nextPageUrl);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])("Should redirect to error page when patch officer filing throws an error", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(true);
        if (url === UPDATE_PAGE_URL) {
          mockGetOfficerFiling.mockResolvedValueOnce({
            referenceAppointmentId: "123"
          });
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({});
        }
        mockPatchOfficerFiling.mockRejectedValueOnce(new Error("Error patching officer filing"));

        const response = await request(app).post(url).send(validData);

        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });
    });

  describe("Welsh language tests", () => {

    //get test
    it.each([[APPOINT_PAGE_URL_WELSH, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END + "?lang=cy"],[UPDATE_PAGE_URL_WELSH, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END + "?lang=cy"]])
    ("Should navigate to director residential address manual page in welsh with backlink containing lang param.", async (url, backLinkUrl) => {
      mockGetOfficerFiling.mockResolvedValue({});

      const response = await request(app).get(url);

      expect(response.text).toContain(PAGE_HEADING_WELSH);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      expect(response.text).toContain(backLinkUrl);
    });

    //post test
    it.each([[APPOINT_PAGE_URL_WELSH], [UPDATE_PAGE_URL_WELSH]])
    ("Should render validation error in welsh with null values passed", async (url) => {
      mockGetOfficerFiling.mockResolvedValue({
        data: {
          firstName: "John",
          lastName: "Smith",
        }
      });

      const response = await request(app).post(url).send({});

      expect(response.text).toContain("Cofnodwch enw neu rif eiddo");
    });
  });
});
