jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/company.profile.service");
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/validation.status.service");
jest.mock("../../../src/services/transaction.service");
jest.mock("../../../src/services/stop.page.validation.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { getOfficerFiling } from "../../../src/services/officer.filing.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from "../../../src/types/page.urls";
import { getValidationStatus } from "../../../src/services/validation.status.service";
import { mockValidValidationStatusResponse } from "../../mocks/validation.status.response.mock";
import { closeTransaction } from "../../../src/services/transaction.service";
import { getCurrentOrFutureDissolved } from "../../../src/services/stop.page.validation.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockCloseTransaction = closeTransaction as jest.Mock;
const mockGetCurrentOrFutureDissolved = getCurrentOrFutureDissolved as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_URL = UPDATE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_HEADING = "Check your answers before submitting the update";

describe("Director check your answers controller tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("GET tests", () => {
    it("Should navigate to director check your answers page", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({})
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
    });
  });

  describe("POST tests", () => {
    it("Should redirect on submission", async () => {
      mockGetCurrentOrFutureDissolved.mockResolvedValueOnce(false);
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      const response = await request(app).post(PAGE_URL).send({});
      expect(response.text).toContain("Redirecting to");
    })
  });

});