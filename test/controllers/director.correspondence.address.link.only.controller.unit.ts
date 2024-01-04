jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/controllers/director.residential.address.controller");
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { urlUtilsRequestParams } from "../../src/controllers/director.residential.address.controller";
import { getOfficerFiling } from "../../src/services/officer.filing.service";
import {
  urlParams, 
  DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_ONLY_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
} from "../../src/types/page.urls";
import { REGISTERED_OFFICE_ADDRESS_MOCK } from "../mocks/company.profile.mock";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { SA_TO_ROA_ERROR } from "../../src/utils/constants";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockUrlUtilsRequestParams  = urlUtilsRequestParams as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Confirm, ";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

const PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_ONLY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL_YES = DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL_NO = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director correspondence address link only controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockUrlUtilsRequestParams.mockClear();
    });
  
    describe("get tests", () => {
      it("Should navigate to correspondence address link only page with no radio buttons selected", async () => {
        mockUrlUtilsRequestParams.mockResolvedValueOnce({ officerFiling: {
          title: "title1",
          firstName: "first1",
          middleNames: "middle1",
          lastName: "last1"
        }, companyProfile: {
          registeredOfficeAddress: REGISTERED_OFFICE_ADDRESS_MOCK
        }});
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("First1 Middle1 Last1");
        expect(response.text).toContain('value="sa_to_roa_yes" aria-describedby');
        expect(response.text).toContain('value="sa_to_roa_no" aria-describedby');
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should navigate to correspondence address link page with yes radio selected", async () => {
        mockUrlUtilsRequestParams.mockResolvedValueOnce({ officerFiling: {
          title: "title1",
          firstName: "first1",
          middleNames: "middle1",
          lastName: "last1",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        }, companyProfile: {
          registeredOfficeAddress: REGISTERED_OFFICE_ADDRESS_MOCK
        }});
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain('value="sa_to_roa_yes" checked');
      });

      it("Should navigate to correspondence address link page with no radio selected", async () => {
        mockUrlUtilsRequestParams.mockResolvedValueOnce({ officerFiling: {
          title: "title1",
          firstName: "first1",
          middleNames: "middle1",
          lastName: "last1",
          isServiceAddressSameAsRegisteredOfficeAddress: false
        }, companyProfile: {
          registeredOfficeAddress: REGISTERED_OFFICE_ADDRESS_MOCK
        }});
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain('value="sa_to_roa_no" checked');
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should catch error when officer filing returned error ", async () => {
        mockUrlUtilsRequestParams.mockRejectedValueOnce(new Error("Error getting officer filing"));
        
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });
    });

    describe("post tests", () => {
      it("should redirect to director residential addess when yes radio selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
        });

        const response = await request(app).post(PAGE_URL).send({"sa_to_roa": "sa_to_roa_yes"});

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL_YES);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("should redirect to director correspondence address page when no radio selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
        });

        const response = await request(app).post(PAGE_URL).send({"sa_to_roa": "sa_to_roa_no"});

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL_NO);
      });

      it("should display an error when no radio button is selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director"
        });

        const response = await request(app).post(PAGE_URL);
        expect(response.text).toContain(SA_TO_ROA_ERROR);
      });

      it("should catch error", async () => {
        const response = await request(app).post(PAGE_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });
    });
});
