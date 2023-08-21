jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { getValidationStatus } from "../../src/services/validation.status.service";
import { DIRECTOR_DATE_OF_BIRTH_PATH, DIRECTOR_NAME_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { mockValidValidationStatusResponse, mockValidationStatusErrorFormerNames, mockValidationStatusErrorLastName, mockValidationStatusErrorTitle, mockValidationStatusResponseDirectorName } from "../mocks/validation.status.response.mock";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { buildValidationErrors } from "../../src/controllers/director.name.controller";
import { formerNamesErrorMessageKey, lastNameErrorMessageKey, titleErrorMessageKey } from "../../src/utils/api.enumerations.keys";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

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
      mockGetValidationStatus.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to director name page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          httpStatusCode: 200,
          resource: {
            referenceAppointmentId: "app1",
            referenceEtag: "ETAG"
          }
        });
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
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        
        const response = await request(app).post(DIRECTOR_NAME_URL);

        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_DATE_OF_BIRTH_URL);
      });

      it("Should display errors on page if get validation status returns errors", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorTitle],
          isValid: false
        }
        mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
  
        const response = await request(app).post(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain("Title can be no longer than 50 characters");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
      });

      it("buildValidationErrors should return title validation errors", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorTitle],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(titleErrorMessageKey.TITLE_LENGTH);
      });

      it("buildValidationErrors should return formerNames validation errors", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorFormerNames],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(formerNamesErrorMessageKey.FORMER_NAMES_CHARACTERS);
      });

      it("buildValidationErrors should return multiple validation errors, one for each input field", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorTitle, mockValidationStatusErrorLastName, mockValidationStatusErrorFormerNames],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(titleErrorMessageKey.TITLE_LENGTH);
        expect(validationErrors.map(error => error.messageKey)).toContain(lastNameErrorMessageKey.LAST_NAME_BLANK);
        expect(validationErrors.map(error => error.messageKey)).toContain(formerNamesErrorMessageKey.FORMER_NAMES_CHARACTERS);
      });
      
    });
});
