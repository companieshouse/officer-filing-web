jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH_END, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  urlParams
} from "../../src/types/page.urls";
import { getOfficerFiling } from "../../src/services/officer.filing.service";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Confirm the director's correspondence address";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director confirm correspondence address controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to director confirm correspondence address page", async () => {
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
          serviceAddress: {
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

      it("Should navigate back button to search page if officerFiling.correspondenceAddressBackLink includes " + DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          serviceAddressBackLink: "/director-correspondence-address-search"
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END);
      });

      it("Should navigate back button to choose address array page if officerFiling.correspondenceAddressBackLink includes " + DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          serviceAddressBackLink: "/choose-correspondence-address"
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END);
      });

      it("Should navigate back button to choose address array page if officerFiling.correspondenceAddressBackLink includes " + DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH_END, async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          serviceAddressBackLink: "/director-correspondence-address-manual"
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH_END);
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

        expect(response.text).toContain("backLink=confirm-correspondence-address");
      });
    });

    describe("post tests", () => {
  
      it("Should redirect to residential address page", async () => {
        const response = await request(app).post(PAGE_URL);

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });
      
    });
});
