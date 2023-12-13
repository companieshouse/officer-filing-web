jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling } from "../../src/services/officer.filing.service";

import { 
  urlParams, 
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { HA_TO_SA_ERROR } from "../../src/utils/constants";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "If the director&#39;s correspondence address changes in the future, do you want this to apply to their home address too?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

const PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = DIRECTOR_PROTECTED_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const APPOINT_DIRECTORS_CYA_URL = APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director residential address link controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to residential address link page with no radio buttons selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer"
        })
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("Testfirst Testmiddle Testlast");
        expect(response.text).toContain('value="ha_to_sa_yes" aria-describedby');
        expect(response.text).toContain('value="ha_to_sa_no" aria-describedby');
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });
/*
      it("Should navigate to residential address link page with yes radio selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsHomeAddress: true
        })
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain('value="ha_to_sa_yes" checked');
      });

      it("Should navigate to residential address link page with no radio selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsHomeAddress: false
        })
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain('value="ha_to_sa_no" checked');
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
*/
    });
/*
    describe("post tests", () => {
      it("should redirect to director protected details page when yes radio selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          checkYourAnswersLink: undefined
        })
        const response = await request(app).post(PAGE_URL).send({"ha_to_sa": "ha_to_sa_yes"});

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("should redirect to appoint directors check your answers page if CYA link is present", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          checkYourAnswersLink: APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
        })
        const response = await request(app).post(PAGE_URL).send({"ha_to_sa": "ha_to_sa_yes"});

        expect(response.text).toContain("Found. Redirecting to " + APPOINT_DIRECTORS_CYA_URL);
      });

      it("should redirect to director protected details page when no radio selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director"
        })
        const response = await request(app).post(PAGE_URL).send({"ha_to_sa": "ha_to_sa_no"});

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
      });

      it("should display an error when no radio button is selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director"
        })

        const response = await request(app).post(PAGE_URL);
        expect(response.text).toContain(HA_TO_SA_ERROR);
      });

      it("should catch error", async () => {
        const response = await request(app).post(PAGE_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });
    });
    */
});
