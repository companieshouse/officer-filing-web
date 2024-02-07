jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import {
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
  CHECK_YOUR_ANSWERS_PATH_END,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
  urlParams
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Confirm where the director lives";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = DIRECTOR_PROTECTED_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const APPOINT_DIRECTOR_CHECK_ANSWERS_URL = APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director confirm residential address controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to director confirm residential address page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith"
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should populate details on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          name: "John Smith",
          residentialAddress: {
            premises: "110",
            addressLine1: "Test line 1",
            addressLine2: "Downing Street",
            locality: "Westminster",
            region: "London",
            country: "United Kingdom",
            postalCode: "SW1A 2AA"
          }
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain("John Smith");
        expect(response.text).toContain("110");
        expect(response.text).toContain("Test Line 1");
        expect(response.text).toContain("Downing Street");
        expect(response.text).toContain("Westminster");
        expect(response.text).toContain("London");
        expect(response.text).toContain("United Kingdom");
        expect(response.text).toContain("SW1A 2AA");
      });

      it("Should navigate back button to search page if officerFiling.residentialAddressBackLink includes DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          residentialAddressBackLink: DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END);
      });

      it("Should navigate back button to choose address array page if officerFiling.residentialAddressBackLink includes DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          residentialAddressBackLink: DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("should catch error if getofficerfiling error", async () => {
        const response = await request(app).get(PAGE_URL);
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it("should populate backLink parameter", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith"
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain("backLink=confirm-residential-address");
      });
    });

    describe("post tests", () => {
  
      it("Should redirect to director protected details page", async () => {
        mockGetOfficerFiling.mockReturnValueOnce({});
        const response = await request(app).post(PAGE_URL);

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should redirect to appoint director check your answer page if filing has check your answers link", async () => {
        mockGetOfficerFiling.mockReturnValueOnce({
          checkYourAnswersLink: CHECK_YOUR_ANSWERS_PATH_END
        });
        const response = await request(app).post(PAGE_URL);

        expect(response.text).toContain("Found. Redirecting to " + APPOINT_DIRECTOR_CHECK_ANSWERS_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("should catch error", async () => {
        mockPatchOfficerFiling.mockRejectedValue(new Error())       
        const response = await request(app).post(PAGE_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });  
  
      it("should set home address same as service address to false", async () => {
        const response = await request(app).post(PAGE_URL);
        mockPatchOfficerFiling.mockReturnValueOnce({
          data: {
            isHomeAddressSameAsServiceAddress: false
          }
        });
        
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
          isHomeAddressSameAsServiceAddress: false
        }));
      });
    });
});
