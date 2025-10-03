jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.appointments.service");
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/remove.directors.error.keys.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DATE_DIRECTOR_REMOVED_PATH, REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams} from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { patchOfficerFiling, getOfficerFiling } from "../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";
import { validCompanyAppointment } from "../mocks/company.appointment.mock";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { mockValidValidationStatusResponse, mockValidationStatusResponseList, mockValidationStatusResponsePreOct2009 } from "../mocks/validation.status.response.mock";
import { retrieveErrorMessageToKey, retrieveStopPageTypeToDisplay } from "../../src/services/remove.directors.error.keys.service";
import { lookupWebValidationMessage } from "../../src/utils/api.enumerations";
import { Response } from "superagent";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointment);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockRetrieveErrorMessageToDisplay = retrieveErrorMessageToKey as jest.Mock;
const mockRetrieveStopPageTypeToDisplayy = retrieveStopPageTypeToDisplay as jest.Mock;
const mockLookupWebValidationMessage = lookupWebValidationMessage as jest.Mock;


const COMPANY_NUMBER = "12345678";
const APPOINTMENT_ID = "987654321";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "When was the director removed from the company?";
const PAGE_HEADING_WELSH = "Pryd cafodd y cyfarwyddwr ei ddileu o&#39;r cwmni?";
const REMOVE_DIRECTOR_URL = DATE_DIRECTOR_REMOVED_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const TM01_CHECK_YOUR_ANSWERS_URL = REMOVE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Remove director date controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockCreateSessionMiddleware.mockClear();
    mockGetCompanyProfile.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
    mockGetValidationStatus.mockClear();
    mockPatchOfficerFiling.mockClear();
    mockGetOfficerFiling.mockClear();
    mockRetrieveErrorMessageToDisplay.mockClear();
    mockRetrieveStopPageTypeToDisplayy.mockClear();
    mockLookupWebValidationMessage.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to date of removal page", async () => {
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .get(REMOVE_DIRECTOR_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it('should display name in uppercase if the officer role is CORPORATE_DIRECTOR', async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValue(
        {name: "test corporate director name", 
        officerRole: "corporate-director"}
      );
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });
      const response = await request(app).get(REMOVE_DIRECTOR_URL)
      expect(response.text).toContain('TEST CORPORATE DIRECTOR NAME');
    });

    it('should display name in uppercase if the officer role is CORPORATE_NOMINEE_DIRECTOR', async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValue(
        {name: "test corporate director name", 
        officerRole: "corporate-nominee-director"}
      );
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });
      const response = await request(app).get(REMOVE_DIRECTOR_URL)
      expect(response.text).toContain('TEST CORPORATE DIRECTOR NAME');
    });

    it('should display name in Title Case if the officer role is not a CORPORATE_DIRECTOR or CORPORATE_NOMINEE_DIRECTOR', async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValue({
        forename: "john",
        surname: "doe",
        otherForenames: "ELIZABETH",
      });
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });
      const response = await request(app).get(REMOVE_DIRECTOR_URL)
      expect(response.text).toContain('John Elizabeth Doe');
    });


    it("Should navigate to date of removal page in welsh", async () => {
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .get(REMOVE_DIRECTOR_URL+"?lang=cy");

      expect(response.text).toContain(PAGE_HEADING_WELSH);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should display date of removal fields and directors name", async () => {
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });
      
      const response = await request(app)
        .get(REMOVE_DIRECTOR_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Day");
      expect(response.text).toContain("Month");
      expect(response.text).toContain("Year");
    });

    it("Should pre-populate removal date fields if data has been previously entered", async () => {
      mockGetOfficerFiling.mockReturnValueOnce({
        resignedOn: "2023-02-01",
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .get(REMOVE_DIRECTOR_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Day");
      expect(response.text).toContain("Month");
      expect(response.text).toContain("Year");
      expect(response.text).toContain("01");
      expect(response.text).toContain("02");
      expect(response.text).toContain("2023");
    });

    it("Should error if appointment id doesn't exist", async () => {
      mockGetOfficerFiling.mockReturnValueOnce({});

      let res: Response;
      try {
        res = await request(app)
          .get(REMOVE_DIRECTOR_URL)
          .expect(500);
      } catch(e) {
        expect(e).toContain("Appointment id is undefined");
      }
    });

  });

  describe("post tests", () => {

    it("Should redirect to next page if no errors", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "7",
                "removal_date-month": "08",
                "removal_date-year": "2010" });

        expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/remove-director-check-answers");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
          resignedOn: "2010-08-07"
        });
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should redirect to next page if no errors with welsh language param", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL + "?lang=cy")
        .send({ "removal_date-day": "7",
          "removal_date-month": "08",
          "removal_date-year": "2010" });

      expect(response.text).toContain("Found. Redirecting to " + TM01_CHECK_YOUR_ANSWERS_URL + "?lang=cy");
      expect(mockGetValidationStatus).toHaveBeenCalled();
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
        resignedOn: "2010-08-07"
      });
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });
    
    it("Should redirect to next page if no errors - day and month are larger than 10", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "27",
                "removal_date-month": "12",
                "removal_date-year": "2010" });

        expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/remove-director-check-answers");
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
          resignedOn: "2010-12-27"
        });
    });

    it("Should display error before patching if day is not a number", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockLookupWebValidationMessage.mockReturnValueOnce("Date the director was removed must be a real date");
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "x",
                "removal_date-month": "8",
                "removal_date-year": "2010" });

        expect(response.text).toContain("John Elizabeth Doe");       
        expect(response.text).toContain("Date the director was removed must be a real date");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error before patching if day is not a number for corporate directors", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockLookupWebValidationMessage.mockReturnValueOnce("Date the director was removed must be a real date");
      mockGetCompanyAppointmentFullRecord.mockResolvedValue(
        {name: "test corporate director name", 
        officerRole: "corporate-director"}
      );
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "x",
                "removal_date-month": "8",
                "removal_date-year": "2010" });

        expect(response.text).toContain("TEST CORPORATE DIRECTOR NAME");       
        expect(response.text).toContain("Date the director was removed must be a real date");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error before patching if month cannot exist", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockLookupWebValidationMessage.mockReturnValueOnce("Date the director was removed must be a real date");
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "7",
                "removal_date-month": "15",
                "removal_date-year": "2010" });

        expect(response.text).toContain("Date the director was removed must be a real date");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error before patching if year is missing", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
      mockLookupWebValidationMessage.mockReturnValueOnce("Date the director was removed must include a year");
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "7",
                "removal_date-month": "8",
                "removal_date-year": "" });

        expect(response.text).toContain("Date the director was removed must include a year");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it("Should display error if get validation status returns errors", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponseList);
      mockRetrieveErrorMessageToDisplay.mockReturnValue({messageKey: "removal-date-after-incorporation-date", source: ["removal_date-day", "removal_date-month", "removal_date-year"]});
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "7",
                "removal_date-month": "8",
                "removal_date-year": "2010" });

        expect(response.text).toContain("Enter a date that is on or after the company&#39;s incorporation date");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
    });


    it("Should display error in welsh if get validation status returns errors", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponseList);
      mockRetrieveErrorMessageToDisplay.mockReturnValue({messageKey: "removal-date-after-incorporation-date", source: ["removal_date-day", "removal_date-month", "removal_date-year"]});
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL + "?lang=cy")
        .send({ "removal_date-day": "7",
          "removal_date-month": "8",
          "removal_date-year": "2010" });

      expect(response.text).toContain("Cofnodwch ddyddiad sydd ar neu ar ôl dyddiad corffori’r cwmni");
      expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
      expect(mockGetValidationStatus).toHaveBeenCalled();
      expect(mockPatchOfficerFiling).toHaveBeenCalled();
    });

    it("Should display stop page if validation status returns pre-2009 error", async () => {
      mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponsePreOct2009);
      mockRetrieveErrorMessageToDisplay.mockReturnValueOnce("");
      mockRetrieveStopPageTypeToDisplayy.mockReturnValueOnce("pre-october-2009");
      mockGetOfficerFiling.mockReturnValueOnce({
        referenceAppointmentId: APPOINTMENT_ID
      });

      const response = await request(app)
        .post(REMOVE_DIRECTOR_URL)
        .send({ "removal_date-day": "1",
                "removal_date-month": "1",
                "removal_date-year": "2008" });

                expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/cannot-use?stopType=pre-october-2009");
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should error if appointment id doesn't exist", async () => {
      mockGetOfficerFiling.mockReturnValueOnce({});

      let res: Response;
      try {
        res = await request(app)
          .post(REMOVE_DIRECTOR_URL)
          .send({ "removal_date-day": "1",
                  "removal_date-month": "1",
                  "removal_date-year": "2008" })
          .expect(500);
      } catch(e) {
        expect(e).toContain("Appointment id is undefined");
      }
    });

  });

});
