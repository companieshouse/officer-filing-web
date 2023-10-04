jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getOfficerFiling } from "../../src/services/officer.filing.service";
import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
  urlParams
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
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
      });

      it("Should navigate back button to search page if officerFiling.residentialAddressBackLink includes DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          residentialAddressBackLink: "/director-home-address-search"
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END);
      });

      it("Should navigate back button to choose address array page if officerFiling.residentialAddressBackLink includes DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          residentialAddressBackLink: "/choose-home-address"
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END);
      });

      it("Should navigate back button to choose address array page if officerFiling.residentialAddressBackLink includes DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          residentialAddressBackLink: "/director-home-address-manual"
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {
  
      it("Should redirect to director protected details page", async () => {
        const response = await request(app).post(PAGE_URL);

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
      });
      
    });
});
