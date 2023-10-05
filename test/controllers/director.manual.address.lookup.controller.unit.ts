jest.mock("../../src/utils/feature.flag");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Where does the director live?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

const PAGE_URL = DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Is director personal information protected", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("Get tests", () => {

    it(`should render ${DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PATH} page`, async () => {
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should navigate to error page when feature flag is off", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

  });

  describe("Post tests", () => {
    it("Should redirect to director check your answer page", async () => {
      const response = await request(app).post(PAGE_URL);

      expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
    });
  });
});

