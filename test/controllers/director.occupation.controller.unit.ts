jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_OCCUPATION_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { mockValidValidationStatusResponse, mockValidationStatusErrorOccupation } from "../mocks/validation.status.response.mock";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { buildValidationErrors } from "../../src/controllers/director.occupation.controller";
import { occupationErrorMessageKey, titleErrorMessageKey } from "../../src/utils/api.enumerations.keys";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director's occupation?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const DIRECTOR_OCCUPATION_URL = DIRECTOR_OCCUPATION_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const DIRECTOR_CORRESPONDENCE_ADDRESS_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director occupation controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetValidationStatus.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to director occupation page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          occupation: "Astronaut",
        });
        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should populate filing data on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          occupation: "Astronaut",
        });

        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("Astronaut");
      });

    });

    describe("post tests", () => {
  
      it("Should redirect to correspondense page", async () => {
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        
        const response = await request(app)
          .post(DIRECTOR_OCCUPATION_URL);

        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_CORRESPONDENCE_ADDRESS_URL);
      });

      it("Should display errors on page if get validation status returns errors", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorOccupation],
          isValid: false
        }
        mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
  
        const response = await request(app).post(DIRECTOR_OCCUPATION_URL);
  
        expect(response.text).toContain("Occupation must be 100 characters or less");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
      });
      
    });

    describe("buildValidationErrors tests", () => {

      it("should return occupation validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorOccupation],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(occupationErrorMessageKey.OCCUPATION_LENGTH);
      });

      
    });

});
