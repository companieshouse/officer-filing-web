jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/validation.status.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_DATE_DETAILS_PATH, DIRECTOR_NATIONALITY_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { mockValidValidationStatusResponse, mockValidationStatusError, mockValidationStatusErrorAppointmentDate, mockValidationStatusErrorDob } from "../mocks/validation.status.response.mock";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { buildValidationErrors } from "../../src/controllers/director.date.details.controller";
import { dobDateErrorMessageKey } from "../../src/utils/api.enumerations.keys";
import * as apiEnumerations from "../../src/utils/api.enumerations";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const APPOINTMENT_ID = "987654321";
const PAGE_HEADING = "Date details";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const DIRECTOR_DATE_DETAILS_URL = DIRECTOR_DATE_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_NATIONALITY_URL = DIRECTOR_NATIONALITY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director date details controller tests", () => {

    beforeEach(() => {
      mocks.mockAuthenticationMiddleware.mockClear();
      mocks.mockSessionMiddleware.mockClear();
      mockGetValidationStatus.mockClear();
      mockPatchOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to director date details page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });

        const response = await request(app).get(DIRECTOR_DATE_DETAILS_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_DATE_DETAILS_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should populate filing data on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: APPOINTMENT_ID,
          dateOfBirth: "1993-08-15",
          appointedOn: "2021-09-10"
        });

        const response = await request(app).get(DIRECTOR_DATE_DETAILS_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("1993");
        expect(response.text).toContain("08");
        expect(response.text).toContain("15");
        expect(response.text).toContain("2021");
        expect(response.text).toContain("09");
        expect(response.text).toContain("10");
      });

      it("Should display director name on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: APPOINTMENT_ID,
          firstName: "Jim",
          middleNames: "Mid",
          lastName: "Smith"
        });

        const response = await request(app).get(DIRECTOR_DATE_DETAILS_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("Jim Mid Smith");
      });

    });

    describe("post tests", () => {

      it("Should redirect to director nationality page", async () => {
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });

        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "dob_date-day": "15",
                  "dob_date-month": "08",
                  "dob_date-year": "1993",
                  "appointment_date-day": "10",
                  "appointment_date-month": "09",
                  "appointment_date-year": "2021" });

        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_NATIONALITY_URL);
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
          dateOfBirth: "1993-08-15",
          appointedOn: "2021-09-10"
        });

      });

      it("Should display errors on page if get validation status returns dob error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorDob],
          isValid: false
        }
        mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID,
          firstName: "Jim",
          middleNames: "Mid",
          lastName: "Smith"
        });
  
        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "dob_date-day": "15",
                  "dob_date-month": "08",
                  "dob_date-year": "1993",
                  "appointment_date-day": "10",
                  "appointment_date-month": "09",
                  "appointment_date-year": "2021" });
  
        expect(response.text).toContain("You can only appoint a person as a director if they are at least 16 years old");
        expect(response.text).toContain("1993");
        expect(response.text).toContain("08");
        expect(response.text).toContain("15");
        expect(response.text).toContain("Jim Mid Smith");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
          dateOfBirth: "1993-08-15",
          appointedOn: "2021-09-10"
        });
      });

      it("Should display errors on page if get validation status returns appointment error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorAppointmentDate],
          isValid: false
        }
        mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID,
          firstName: "Jim",
          middleNames: "Mid",
          lastName: "Smith"
        });
  
        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "dob_date-day": "15",
                  "dob_date-month": "08",
                  "dob_date-year": "1993",
                  "appointment_date-day": "10",
                  "appointment_date-month": "09",
                  "appointment_date-year": "2021" });
  
        expect(response.text).toContain("Date the director was appointed must be on or after the incorporation date");
        expect(response.text).toContain("1993");
        expect(response.text).toContain("08");
        expect(response.text).toContain("15");
        expect(response.text).toContain("Jim Mid Smith");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
          dateOfBirth: "1993-08-15",
          appointedOn: "2021-09-10"
        });
      });

      it("Should display error before patching if dob day is not a number", async () => {
        jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date of birth must be a real date");
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });
  
        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "dob_date-day": "x",
                  "dob_date-month": "08",
                  "dob_date-year": "1993",
                  "appointment_date-day": "10",
                  "appointment_date-month": "09",
                  "appointment_date-year": "2021" });
  
        expect(response.text).toContain("Date of birth must be a real date");
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });
  
      it("Should display error before patching if dob month cannot exist", async () => {
        jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date of birth must be a real date");
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });
  
        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "dob_date-day": "15",
                  "dob_date-month": "15",
                  "dob_date-year": "1993",
                  "appointment_date-day": "10",
                  "appointment_date-month": "09",
                  "appointment_date-year": "2021" });
  
        expect(response.text).toContain("Date of birth must be a real date");
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });
  
      it("Should display error before patching if dob year is missing", async () => {
        jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date of birth must include a year");
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });
  
        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "dob_date-day": "15",
                  "dob_date-month": "08",
                  "dob_date-year": "",
                  "appointment_date-day": "10",
                  "appointment_date-month": "09",
                  "appointment_date-year": "2021" });
  
        expect(response.text).toContain("Date of birth must include a year");
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("Should display error before patching if appointed day is not a number", async () => {
        jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date the director was appointed must be a real date");
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID,
        });
  
        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "appointment_date-day": "not a number",
                  "appointment_date-month": "09",
                  "appointment_date-year": "2021",
                  "dob_date-day": "15",
                  "dob_date-month": "08",
                  "dob_date-year": "1993", });
  
        expect(response.text).toContain("Date the director was appointed must be a real date");
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });
  
      it("Should display error before patching if appointed month cannot exist", async () => {
        jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date the director was appointed must be a real date");
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID,
        });
  
        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "appointment_date-day": "10",
                  "appointment_date-month": "13",
                  "appointment_date-year": "2021",
                  "dob_date-day": "15",
                  "dob_date-month": "08",
                  "dob_date-year": "1993", });
  
        expect(response.text).toContain("Date the director was appointed must be a real date");
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });
  
      it("Should display error before patching if appointed year is missing", async () => {
        jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date the director was appointed must include a year");
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID,
        });
  
        const response = await request(app)
          .post(DIRECTOR_DATE_DETAILS_URL)
          .send({ "appointment_date-day": "10",
                  "appointment_date-month": "09",
                  "appointment_date-year": "",
                  "dob_date-day": "15",
                  "dob_date-month": "08",
                  "dob_date-year": "1993", });
  
        expect(response.text).toContain("Date the director was appointed must include a year");
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

    });

    describe("buildValidationErrors tests", () => {

      it("should return underage validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorDob],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors.map(error => error.messageKey)).toContain(dobDateErrorMessageKey.DIRECTOR_UNDERAGE);
      });

      it("should ignore unrelated validation error", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusError],
          isValid: false
        }

        const validationErrors = buildValidationErrors(mockValidationStatusResponse);

        expect(validationErrors).toHaveLength(0);
      });
      
    });
});
