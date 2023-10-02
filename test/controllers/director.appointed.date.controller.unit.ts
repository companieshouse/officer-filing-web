jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/validation.status.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_APPOINTED_DATE_PATH, DIRECTOR_NATIONALITY_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { mockValidValidationStatusResponse, mockValidationStatusError, mockValidationStatusErrorAppointmentDate, mockValidationStatusErrorUnderageAppointment } from "../mocks/validation.status.response.mock";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { buildValidationErrors } from "../../src/controllers/director.appointed.date.controller";
import { appointmentDateErrorMessageKey } from "../../src/utils/api.enumerations.keys";
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
const PAGE_HEADING = "When was the director appointed?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const DIRECTOR_APPOINTED_DATE_URL = DIRECTOR_APPOINTED_DATE_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const DIRECTOR_NATIONALITY_URL = DIRECTOR_NATIONALITY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director appointed date controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetValidationStatus.mockClear();
    mockPatchOfficerFiling.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to director appointed date page", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app).get(DIRECTOR_APPOINTED_DATE_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should navigate to error page when feature flag is off", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(DIRECTOR_APPOINTED_DATE_URL);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it("Should populate filing data on the page", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        referenceAppointmentId: APPOINTMENT_ID,
        appointedOn: "2021-09-10"
      });

      const response = await request(app).get(DIRECTOR_APPOINTED_DATE_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("2021");
      expect(response.text).toContain("09");
      expect(response.text).toContain("10");
    });

    it("Should display director name on the page", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        referenceAppointmentId: APPOINTMENT_ID,
        firstName: "John",
        middleNames: "James",
        lastName: "Smith"
      });

      const response = await request(app).get(DIRECTOR_APPOINTED_DATE_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("John James Smith");
    });

  });

  describe("post tests", () => {

    it("Should redirect to director nationality page", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(DIRECTOR_APPOINTED_DATE_URL)
        .send({ "appointment_date-day": "10",
                "appointment_date-month": "09",
                "appointment_date-year": "2021" });
      
      expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_NATIONALITY_URL);
      expect(mockGetValidationStatus).toHaveBeenCalled();
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
        appointedOn: "2021-09-10"
      });
    });

    it("Should display errors on page if get validation status returns errors", async () => {
      const mockValidationStatusResponse: ValidationStatusResponse = {
        errors: [mockValidationStatusErrorAppointmentDate],
        isValid: false
      }
      
      mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID,
        firstName: "John",
        middleNames: "James",
        lastName: "Smith"
      });

      const response = await request(app)
        .post(DIRECTOR_APPOINTED_DATE_URL)
        .send({ "appointment_date-day": "10",
                "appointment_date-month": "09",
                "appointment_date-year": "2021" });

      expect(response.text).toContain("Date the director was appointed must be on or after the incorporation date");
      expect(response.text).toContain("John James Smith");
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("10");
      expect(response.text).toContain("09");
      expect(response.text).toContain("2021");
      expect(mockGetValidationStatus).toHaveBeenCalled();
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
        appointedOn: "2021-09-10"
      });
    });

    it("Should display error before patching if day is not a number", async () => {
      jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date the director was appointed must be a real date");
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID,
      });

      const response = await request(app)
        .post(DIRECTOR_APPOINTED_DATE_URL)
        .send({ "appointment_date-day": "not a number",
                "appointment_date-month": "09",
                "appointment_date-year": "2021" });

      expect(response.text).toContain("Date the director was appointed must be a real date");
      expect(mockGetValidationStatus).not.toHaveBeenCalled();
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error before patching if month cannot exist", async () => {
      jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date the director was appointed must be a real date");
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID,
      });

      const response = await request(app)
        .post(DIRECTOR_APPOINTED_DATE_URL)
        .send({ "appointment_date-day": "10",
                "appointment_date-month": "13",
                "appointment_date-year": "2021" });

      expect(response.text).toContain("Date the director was appointed must be a real date");
      expect(mockGetValidationStatus).not.toHaveBeenCalled();
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error before patching if year is missing", async () => {
      jest.spyOn(apiEnumerations, 'lookupWebValidationMessage').mockReturnValueOnce("Date the director was appointed must include a year");
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID,
      });

      const response = await request(app)
        .post(DIRECTOR_APPOINTED_DATE_URL)
        .send({ "appointment_date-day": "10",
                "appointment_date-month": "09",
                "appointment_date-year": "" });

      expect(response.text).toContain("Date the director was appointed must include a year");
      expect(mockGetValidationStatus).not.toHaveBeenCalled();
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

  });

  describe("buildValidationErrors tests", () => {

    it("should return appointment date prior to incorporation date validation error", async () => {
      const mockValidationStatusResponse: ValidationStatusResponse = {
        errors: [mockValidationStatusErrorAppointmentDate],
        isValid: false
      }
      const validationErrors = buildValidationErrors(mockValidationStatusResponse);

      expect(validationErrors.length).toBe(1);
      expect(validationErrors.map(error => error.messageKey)).toContain(appointmentDateErrorMessageKey.AFTER_INCORPORATION_DATE);
    });

    it("should return underage validation error", async () => {
      const mockValidationStatusResponse: ValidationStatusResponse = {
        errors: [mockValidationStatusErrorUnderageAppointment],
        isValid: false
      }

      const validationErrors = buildValidationErrors(mockValidationStatusResponse);

      expect(validationErrors.map(error => error.messageKey)).toContain(appointmentDateErrorMessageKey.APPOINTMENT_DATE_UNDERAGE);
    });

    it("should ignore unrelated validation error", async () => {
      const mockValidationStatusResponse: ValidationStatusResponse = {
        errors: [mockValidationStatusError],
        isValid: false
      }
      const validationErrors = buildValidationErrors(mockValidationStatusResponse);

      expect(validationErrors.length).toBe(0);
    });
    
  });
});
