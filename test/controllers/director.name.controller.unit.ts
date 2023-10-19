jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { getValidationStatus } from "../../src/services/validation.status.service";
import { DIRECTOR_DATE_OF_BIRTH_PATH, DIRECTOR_NAME_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { mockValidValidationStatusResponse, mockValidationStatusError, mockValidationStatusErrorFormerNames, mockValidationStatusErrorLastName, mockValidationStatusErrorTitle } from "../mocks/validation.status.response.mock";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { buildValidationErrors } from "../../src/controllers/director.name.controller";
import { formerNamesErrorMessageKey, lastNameErrorMessageKey, titleErrorMessageKey } from "../../src/utils/api.enumerations.keys";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";

const req = {} as Request;
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
          referenceAppointmentId: "app1",
          referenceEtag: "ETAG"
        });
        const response = await request(app).get(DIRECTOR_NAME_URL).set({"referer": "director-name"});
  
        expect(response.text).toContain(PAGE_HEADING);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should populate filing data on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer"
        });

        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("testTitle");
        expect(response.text).toContain("testFirst");
        expect(response.text).toContain("testMiddle");
        expect(response.text).toContain("testLast");
        expect(response.text).toContain("testFormer");
      });

    });

    describe("post tests", () => {
  
      it("Should redirect to date of birth page", async () => {
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});
  
        
        const response = await request(app)
          .post(DIRECTOR_NAME_URL)
          .send({ "previous_names_radio": "No" });

        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_DATE_OF_BIRTH_URL);
      });

      it("Should display errors on page if get validation status returns errors", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorTitle],
          isValid: false
        }
        mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});
  
        const response = await request(app).post(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain("Title must be 50 characters or less");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
      });
      
    });

    describe("buildValidationErrors tests", () => {

      it("should return title validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorTitle],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse, 'No', '');

        expect(validationErrors.map(error => error.messageKey)).toContain(titleErrorMessageKey.TITLE_LENGTH);
      });

      it("should return formerNames validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorFormerNames],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse, 'Yes', 'abc');

        expect(validationErrors.map(error => error.messageKey)).toContain(formerNamesErrorMessageKey.FORMER_NAMES_CHARACTERS);
      });

      it("should return formerNames validation error no radio button is selected", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorFormerNames],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse, '', 'abc');

        expect(validationErrors.map(error => error.messageKey)).toContain(formerNamesErrorMessageKey.FORMER_NAMES_RADIO_UNSELECTED);
      });

      it("should return formerNames validation error if Yes is selected but a value is not entered", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorFormerNames],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse, 'Yes', '');

        expect(validationErrors.map(error => error.messageKey)).toContain(formerNamesErrorMessageKey.FORMER_NAMES_MISSING);
      });

      it("should return multiple validation errors, one for each input field", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorTitle, mockValidationStatusErrorLastName, mockValidationStatusErrorFormerNames],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse, 'Yes', 'abc');

        expect(validationErrors.map(error => error.messageKey)).toContain(titleErrorMessageKey.TITLE_LENGTH);
        expect(validationErrors.map(error => error.messageKey)).toContain(lastNameErrorMessageKey.LAST_NAME_BLANK);
        expect(validationErrors.map(error => error.messageKey)).toContain(formerNamesErrorMessageKey.FORMER_NAMES_CHARACTERS);
      });

      it("should ignore unrelated validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusError],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse, 'No', '');

        expect(validationErrors).toHaveLength(0);
      });
      
    });
});
