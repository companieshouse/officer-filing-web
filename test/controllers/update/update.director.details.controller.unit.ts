jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/company.profile.service");
jest.mock("../../../src/services/officer.filing.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { getOfficerFiling } from "../../../src/services/officer.filing.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { UPDATE_DIRECTOR_DETAILS_PATH, urlParams } from "../../../src/types/page.urls";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";

const PAGE_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_HEADING = "Address details";

describe("Director details tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("GET tests", () => {
    it("Should display to update director details page", async () => {
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain("Update the director's details");
      expect(response.text).toContain("Director details");
      expect(response.text).toContain("Address details");
    });

    it("should catch error if error occurred", async () => {
      mockGetOfficerFiling.mockRejectedValue("Error getting officer filing");
      const response = await request(app).get(PAGE_URL);
      expect(response.text).not.toContain(PAGE_HEADING);
      expect(response.text).toContain(ERROR_PAGE_HEADING)
    });
  });

  describe("POST tests", () => {
    it("Should redirect on submission", async () => {
      const response = await request(app).post(PAGE_URL).send({});
      expect(response.text).toContain("Redirecting to");
    })
  });

})