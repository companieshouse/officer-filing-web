jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/remove.directors.check.answers.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/utils/api.enumerations");
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/transaction.service");
jest.mock("../../src/services/remove.directors.error.keys.service");
jest.mock("../../src/services/company.appointments.service");
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { mockCompanyOfficer, mockCompanyOfficerMissingDateOfBirth, mockCompanyOfficerMissingDateOfBirthDay, mockCompanyOfficerMissingResignedOn, mockCorporateCompanyOfficer, mockCorporateNomineeCompanyOfficer } from "../mocks/remove.director.check.answers.mock";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getDirectorAndTerminationDate } from "../../src/services/remove.directors.check.answers.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { mockValidValidationStatusResponse, mockValidationStatusResponseList } from "../mocks/validation.status.response.mock";
import { closeTransaction } from "../../src/services/transaction.service";
import { retrieveStopPageTypeToDisplay } from "../../src/services/remove.directors.error.keys.service";
import { STOP_TYPE } from "../../src/utils/constants";
import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";
import { getOfficerFiling } from "../../src/services/officer.filing.service";
import { validCompanyAppointment } from "../mocks/company.appointment.mock";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetDirectorAndTerminationDate = getDirectorAndTerminationDate as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointment);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
mockGetDirectorAndTerminationDate.mockResolvedValue(mockCompanyOfficer);
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockCloseTransaction = closeTransaction as jest.Mock;
const mockRetrieveStopScreen = retrieveStopPageTypeToDisplay as jest.Mock;

const COMPANY_NUMBER = "12345678";
const SUBMISSION_ID = "987654321";
const TRANSACTION_ID = "11223344";
const PAGE_HEADING = "Test Company";
const CHECK_ANSWERS_URL = REMOVE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with this service";

describe("Remove director check answers controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetDirectorAndTerminationDate.mockClear();
    mockGetCompanyProfile.mockClear();
    mockGetValidationStatus.mockClear();
    mockCloseTransaction.mockClear();
    mockRetrieveStopScreen.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
    mockGetOfficerFiling.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to current directors page", async () => {
      mockGetOfficerFiling.mockResolvedValue({data:{
        referenceAppointmentId: "ref_id"
      }});
      const response = await request(app).get(CHECK_ANSWERS_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display summary for the non corporate director", async () => {
      mockGetOfficerFiling.mockResolvedValue({data:{
        referenceAppointmentId: "ref_id"
      }});
      const response = await request(app).get(CHECK_ANSWERS_URL);

      expect(mockGetDirectorAndTerminationDate).toHaveBeenCalled();
      expect(response.text).toContain("Company name");
      expect(response.text).toContain("Test Company");
      expect(response.text).toContain("Company number");
      expect(response.text).toContain("12345678");
      expect(response.text).toContain("Name");
      expect(response.text).toContain("Mr John Middlename Doe");
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("5 November 2002");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("1 December 2022");
      expect(response.text).toContain("Date the director was removed from the company");
      expect(response.text).toContain("4 December 2022");
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should display summary for the corporate directors, missing date of birth", async () => {
      mockGetOfficerFiling.mockResolvedValue({data:{
        referenceAppointmentId: "ref_id"
      }});
      mockGetDirectorAndTerminationDate.mockResolvedValue(mockCorporateCompanyOfficer);
      const response = await request(app).get(CHECK_ANSWERS_URL);
      expect(mockGetDirectorAndTerminationDate).toHaveBeenCalled();
      expect(response.text).toContain("Company name");
      expect(response.text).toContain("Test Company");
      expect(response.text).toContain("Company number");
      expect(response.text).toContain("12345678");
      expect(response.text).toContain("Name");
      expect(response.text).toContain("Blue Enterprises");
      expect(response.text.includes("Date of birth")).toEqual(false);
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("1 December 2022");
      expect(response.text).toContain("Date the director was removed from the company");
      expect(response.text).toContain("4 December 2022");
    });

    it("Should display summary for the corporate-nominee directors, missing date of birth", async () => {
      mockGetOfficerFiling.mockResolvedValue({data:{
        referenceAppointmentId: "ref_id"
      }});
      mockGetDirectorAndTerminationDate.mockResolvedValue(mockCorporateNomineeCompanyOfficer);
      const response = await request(app).get(CHECK_ANSWERS_URL);
      expect(mockGetDirectorAndTerminationDate).toHaveBeenCalled();
      expect(response.text).toContain("Company name");
      expect(response.text).toContain("Test Company");
      expect(response.text).toContain("Company number");
      expect(response.text).toContain("12345678");
      expect(response.text).toContain("Name");
      expect(response.text).toContain("Blue Enterprises");
      expect(response.text.includes("Date of birth")).toEqual(false);
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("1 December 2022");
      expect(response.text).toContain("Date the director was removed from the company");
      expect(response.text).toContain("4 December 2022");
    });

    it("Should still render page if date of birth is missing", async () => {
      mockGetOfficerFiling.mockResolvedValue({data:{
        referenceAppointmentId: "ref_id"
      }});
      mockGetDirectorAndTerminationDate.mockResolvedValue(mockCompanyOfficerMissingDateOfBirth);
      const response = await request(app).get(CHECK_ANSWERS_URL);
      expect(response.text).toContain("Company name");
      expect(response.text).toContain("Test Company");
      expect(response.text).toContain("Company number");
      expect(response.text).toContain("12345678");
      expect(response.text).toContain("Name");
      expect(response.text).toContain("Mr John Middlename Doe");
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("1 December 2022");
      expect(response.text).toContain("Date the director was removed from the company");
      expect(response.text).toContain("4 December 2022");
    });

    it("Should display date of birth without day if day field is missing", async () => {
      mockGetOfficerFiling.mockResolvedValue({data:{
        referenceAppointmentId: "ref_id"
      }});
      mockGetDirectorAndTerminationDate.mockResolvedValue(mockCompanyOfficerMissingDateOfBirthDay);
      const response = await request(app).get(CHECK_ANSWERS_URL);
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("November 2002");
    });

    it("Should throw an internal server error if resigned on date is missing", async () => {
      mockGetDirectorAndTerminationDate.mockResolvedValue(mockCompanyOfficerMissingResignedOn);
      const response = await request(app).get(CHECK_ANSWERS_URL);
      expect(response.text).toContain("Sorry, there is a problem with this service");
    });

  });

  describe("post tests", () => {
    it("Should redirect to next page if no errors", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockCloseTransaction.mockResolvedValueOnce("closed");

      const response = await request(app).post(CHECK_ANSWERS_URL);

      expect(mockGetValidationStatus).toHaveBeenCalled();
      expect(mockCloseTransaction).toHaveBeenCalled();
      expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/987654321/remove-director-submitted");
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should redirect to appropriate stop screen if validation status errors (DISSOLVED)", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponseList);
      mockRetrieveStopScreen.mockReturnValueOnce(STOP_TYPE.DISSOLVED);

      const response = await request(app).post(CHECK_ANSWERS_URL);

      expect(mockGetValidationStatus).toHaveBeenCalled();
      expect(mockCloseTransaction).not.toHaveBeenCalled();
      expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=dissolved");
    });

    it("Should redirect to error 500 screen if close transaction returns errors", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockCloseTransaction.mockRejectedValue(new Error("can't connect"));

      const response = await request(app).post(CHECK_ANSWERS_URL);

      expect(mockGetValidationStatus).toHaveBeenCalled();
      expect(mockCloseTransaction).toHaveBeenCalled();
      expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    });
  });
});
