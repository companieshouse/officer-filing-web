jest.mock("../../src/utils/feature.flag")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_DATE_OF_BIRTH_PATH, DIRECTOR_NAME_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director's name?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const DIRECTOR_NAME_URL = DIRECTOR_NAME_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_DATE_OF_BIRTH_URL = DIRECTOR_DATE_OF_BIRTH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director name controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to director name page", async () => {
        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {
  
      it("Should redirect to date of birth page", async () => {
        const response = await request(app).post(DIRECTOR_NAME_URL);

        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_DATE_OF_BIRTH_URL);
      });
      
    });
});
