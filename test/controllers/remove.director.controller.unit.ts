jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.appointments.service");
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/remove.directors.date.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { REMOVE_DIRECTOR_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { postOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";
import { validCompanyAppointment } from "../mocks/company.appointment.mock";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { mockValidValidationStatusResponse, mockValidationStatusResponseList } from "../mocks/validation.status.response.mock";
import { retrieveErrorMessageToDisplay } from "../../src/services/remove.directors.error.keys.service";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockPostOfficerFiling = postOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointment);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockRetrieveErrorMessageToDisplay = retrieveErrorMessageToDisplay as jest.Mock;


const COMPANY_NUMBER = "12345678";
const APPOINTMENT_ID = "987654321";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "When was the director removed from the company?";
const REMOVE_DIRECTOR_URL = REMOVE_DIRECTOR_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, APPOINTMENT_ID);

describe("Remove director date controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockPostOfficerFiling.mockClear();
    mockGetCompanyProfile.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
    mockGetValidationStatus.mockClear();
    mockPatchOfficerFiling.mockClear();
    mockRetrieveErrorMessageToDisplay.mockClear();
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
        .get(REMOVE_DIRECTOR_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display date of removal fields and directors name", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: {
          submissionId: SUBMISSION_ID,
          name: "name"
        }
      });

      const response = await request(app)
        .get(REMOVE_DIRECTOR_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("name");
      expect(response.text).toContain("Day");
      expect(response.text).toContain("Month");
      expect(response.text).toContain("Year");
    });

  });

  describe("post tests", () => {

    it("Should redirect to next page if no errors", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "7",
                "removal_date-month": "08",
                "removal_date-year": "2010" });

        expect(response.text).toContain("Found. Redirecting to /officer-filing-web/company/12345678/transaction/11223344/submission/undefined/appointment/987654321/remove-director-check-answers");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, undefined, {
          referenceEtag: "etag",
          resignedOn: "2010-08-07"
        });
    });
    
    it("Should redirect to next page if no errors - day and month are larger than 10", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "27",
                "removal_date-month": "12",
                "removal_date-year": "2010" });

        expect(response.text).toContain("Found. Redirecting to /officer-filing-web/company/12345678/transaction/11223344/submission/undefined/appointment/987654321/remove-director-check-answers");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, undefined, {
          referenceEtag: "etag",
          resignedOn: "2010-12-27"
        });
    });

    it("Should display error before patching if day is not a number", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "x",
                "removal_date-month": "8",
                "removal_date-year": "2010" });

        expect(response.text).toContain("Day must include numbers only");
        expect(mockGetCompanyAppointmentFullRecord).not.toHaveBeenCalled();
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error before patching if month cannot exist", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "7",
                "removal_date-month": "15",
                "removal_date-year": "2010" });

        expect(response.text).toContain("Date must be a real date");
        expect(mockGetCompanyAppointmentFullRecord).not.toHaveBeenCalled();
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error before patching if year is missing", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "7",
                "removal_date-month": "8",
                "removal_date-year": "" });

        expect(response.text).toContain("Date the director was removed must include a year");
        expect(mockGetCompanyAppointmentFullRecord).not.toHaveBeenCalled();
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error if validation status returns errors", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponseList);
      mockRetrieveErrorMessageToDisplay.mockReturnValueOnce("The date you enter must be after the company's incorporation date");

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "7",
                "removal_date-month": "8",
                "removal_date-year": "2010" });

        expect(response.text).toContain("The date you enter must be after the company&#39;s incorporation date");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
    });


  });


});
