jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.appointments.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { REMOVE_DIRECTOR_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { postOfficerFiling } from "../../src/services/officer.filing.service";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockPostOfficerFiling = postOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const COMPANY_NUMBER = "12345678";
const APPOINTMENT_ID = "987654321";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "When was the director removed from the company?";
const CHECK_ANSWERS_URL = REMOVE_DIRECTOR_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, APPOINTMENT_ID);

describe("Remove director date controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockPostOfficerFiling.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to date of removal page", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: {
          submissionId: SUBMISSION_ID,
          name: "name"
        }
      });

      const response = await request(app)
        .get(CHECK_ANSWERS_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

  });
});
