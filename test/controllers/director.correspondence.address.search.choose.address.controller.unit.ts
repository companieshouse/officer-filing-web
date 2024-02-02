jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/postcode.lookup.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END,
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END,
  urlParams
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getUKAddressesFromPostcode } from "../../src/services/postcode.lookup.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetUKAddressesFromPostcode = getUKAddressesFromPostcode as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Choose an address";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const APPOINT_PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const APPOINT_NEXT_PAGE_URL = DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_NEXT_PAGE_URL = UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director correspondence address array page controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockPatchOfficerFiling.mockClear();
      mockGetOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {

      it.each([[APPOINT_PAGE_URL,DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END], [UPDATE_PAGE_URL, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END]])
      ("Should navigate to director choose address page ", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            postalCode: "TE6 6ST"
          }
        });
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce([]);

        const response = await request(app).get(url);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain(backLink);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should navigate to error page when feature flag is off", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[APPOINT_PAGE_URL,DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END], [UPDATE_PAGE_URL, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END]])
      ("Should display addresses when multiple are returned by postcode lookup service", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            postalCode: "TE6 6ST"
          }
        });
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce([
          {
            premise: "1",
            addressLine1: "Test Street",
            addressLine2: "Test Avenue",
            postTown: "Test Town",
            country: "GB-ENG",
            postcode: "TE6 6ST"
          },
          {
            premise: "2",
            addressLine1: "Test Street 2",
            addressLine2: "Test Avenue 2",
            postTown: "Test Town 2",
            country: "GB-ENG",
            postcode: "TE6 6ST"
          },
          {
            premise: "3",
            addressLine1: "Test Street 3",
            postTown: "Test Town 3",
            country: "GB-WLS",
            postcode: "TE6 6ST"
          }
        ]);
        const response = await request(app).get(url);
  
        expect(response.text).toContain("1 Test Street, Test Avenue, Test Town, England, TE6 6ST");
        expect(response.text).toContain("2 Test Street 2, Test Avenue 2, Test Town 2, England, TE6 6ST");
        expect(response.text).toContain("3 Test Street 3, Test Town 3, Wales, TE6 6ST");
        expect(response.text).toContain(backLink);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should navigate to error page when officer filing is undefined", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce(undefined);
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should navigate to error page when officer filing correspondence address is undefined", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({});
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should navigate to error page when officer filing correspondence address postal code is undefined", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {}
        });
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should navigate to error page when officer filing correspondence address postal code is blank", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            postalCode: ""
          }
        });
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should return 500 and render error page when get officer filing throws an error", async (url) => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error());
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should return 500 and render error page when get UK addresses from postcode throws an error", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            postalCode: "TE6 6ST"
          }
        });
        mockGetUKAddressesFromPostcode.mockRejectedValueOnce(new Error());
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {

      it.each([[APPOINT_PAGE_URL,APPOINT_NEXT_PAGE_URL], [UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])
      ("Should redirect to confirmation page", async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            postalCode: "TE6 6ST"
          }
        });
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce([
          {
            premise: "1",
            addressLine1: "Test Street",
            addressLine2: "Test Avenue",
            postTown: "Test Town",
            country: "GB-ENG",
            postcode: "TE6 6ST"
          }
        ]);
        
        const response = await request(app)
          .post(url)
          .send({ "address_array": "1" })

        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should patch officer filing with selected address", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            postalCode: "TE6 6ST"
          }
        });
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce([
          {
            premise: "1",
            addressLine1: "Test Street",
            addressLine2: "Test Avenue",
            postTown: "Test Town",
            country: "GB-ENG",
            postcode: "TE6 6ST"
          }
        ]);
        
        await request(app)
          .post(url)
          .send({ "address_array": "1" })

        expect(mockPatchOfficerFiling).toBeCalledWith(
          expect.anything(),
          TRANSACTION_ID,
          SUBMISSION_ID,
          {
            serviceAddress: {
              premises: "1",
              addressLine1: "Test Street",
              addressLine2: "Test Avenue",
              locality: "Test Town",
              country: "England",
              postalCode: "TE6 6ST"
            }
          }
        );
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should show error if no address is selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          serviceAddress: {
            postalCode: "TE6 6ST"
          }
        });
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce([
          {
            premise: "1",
            addressLine1: "Test Street",
            addressLine2: "Test Avenue",
            postTown: "Test Town",
            country: "GB-ENG",
            postcode: "TE6 6ST"
          }
        ]);
        
        const response = await request(app)
          .post(url)
          .send({ "address_array": "" })

        expect(response.text).toContain("Select the director’s correspondence address");
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should render a page and show error if the postcode is undefined", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({});
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce([]);
        const response = await request(app).post(url);

        expect(response.text).toContain("Select the director’s correspondence address");
      });
      
    });
});
