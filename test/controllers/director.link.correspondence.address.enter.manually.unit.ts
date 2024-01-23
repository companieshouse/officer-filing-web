jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getOfficerFiling } from "../../src/services/officer.filing.service";

import { 
  urlParams, 
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "If the registered office address changes in the future, do you want this to apply to the director&#39;s correspondence address too?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const SA_TO_ROA_ERROR = "Select yes if the registered office address changes in the future, and you want this to apply to your correspondence address too";

const PAGE_URL = DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const PAGE_URL_WELSH = PAGE_URL + "?lang=cy";
const NEXT_PAGE_ON_YES_URL = DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_ON_NO_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director link correspondence address enter manually controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to link correspondence address enter manually link page with no radio buttons selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: undefined
        })
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("Testfirst Testmiddle Testlast");
        expect(response.text).toContain('value="sa_to_roa_yes"');
        expect(response.text).toContain('value="sa_to_roa_no"');
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should navigate to link correspondence address enter manually link page with yes radio selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        })
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain('value="sa_to_roa_yes" checked');
      });

      it("Should navigate to link correspondence address enter manually link page with no radio selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: false
        })
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain('value="sa_to_roa_no" checked');
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should catch error when officer filing returned error ", async () => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
        
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    
      it("Should display the link correspondence address enter manually page in Welsh", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: false
        })
        const response = await request(app).get(PAGE_URL_WELSH);
        expect(response.text).toContain("to be translated");
      });
    });

    describe("post tests", () => {
        
      it("should display an error when no radio button is selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          isServiceAddressSameAsRegisteredOfficeAddress: undefined
        })

        const response = await request(app).post(PAGE_URL);
        expect(response.text).toContain(SA_TO_ROA_ERROR);
      });

      it("should catch error", async () => {
        const response = await request(app).post(PAGE_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it("should navigate to residential address search page when yes radio button is selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          isServiceAddressSameAsRegisteredOfficeAddress: undefined
        })

        const response = await request(app).post(PAGE_URL).send({sa_to_roa: "sa_to_roa_yes"});
        expect(response.header.location).toContain(NEXT_PAGE_ON_YES_URL);
      });

      it("should navigate to correpondence address page when no radio button is selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          isServiceAddressSameAsRegisteredOfficeAddress: undefined
        })

        const response = await request(app).post(PAGE_URL).send({sa_to_roa: "sa_to_roa_no"});
        expect(response.header.location).toContain(NEXT_PAGE_ON_NO_URL);
      });
    });
});