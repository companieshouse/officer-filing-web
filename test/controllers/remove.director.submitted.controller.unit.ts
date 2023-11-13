jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/remove.directors.check.answers.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.appointments.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { REMOVE_DIRECTOR_SUBMITTED_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyAppointment } from "../mocks/company.appointment.mock";
import { getOfficerFiling } from "../../src/services/officer.filing.service";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());

const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

mockGetOfficerFiling.mockResolvedValue({
    referenceAppointmentId: "app1",
    referenceEtag: "ETAG",
    resignedOn: "2008-08-08"
});
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointment);
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Removal of director submitted";
const WHAT_HAPPENS_NEXT = "We'll send a confirmation email to you which contains your reference number."
const FEEDBACK = "This is a new service. Help us improve it by completing our";
const SUBMITTED_URL = REMOVE_DIRECTOR_SUBMITTED_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Remove director submitted controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to removal of director submitted page", async () => {
      const response = await request(app).get(SUBMITTED_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display removal summary for the director", async () => {
      const response = await request(app).get(SUBMITTED_URL);

      expect(mockGetCompanyProfile).toHaveBeenCalled();
      expect(mockGetOfficerFiling).toHaveBeenCalled();
      expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();

      expect(response.text).toContain("Company name");
      expect(response.text).toContain("Test Company");
      expect(response.text).toContain("Company number");
      expect(response.text).toContain("12345678");
      expect(response.text).toContain("Name of director");
      expect(response.text).toContain("John Doe");
      expect(response.text).toContain("Date removed");
      expect(response.text).toContain("8 August 2008");
    });

    it("Should display required subtitles & information", async () => {
      const response = await request(app).get(SUBMITTED_URL);

      expect(mockGetCompanyProfile).toHaveBeenCalled();
      expect(mockGetOfficerFiling).toHaveBeenCalled();
      expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();

      expect(response.text).toContain("What happens next");
      expect(response.text).toContain(WHAT_HAPPENS_NEXT);
      expect(response.text).toContain("What do you want to do next?");
      expect(response.text).toContain("Feedback");
      expect(response.text).toContain(FEEDBACK);
    });    
  
    it("Should throw an internal server error if resigned on date is missing", async () => {
      mockGetOfficerFiling.mockResolvedValue({
        httpStatusCode: 200,
        resource: {
          referenceAppointmentId: "app1",
          referenceEtag: "ETAG",
        }
      });
      const response = await request(app).get(SUBMITTED_URL);
      expect(response.text).toContain("Sorry, there is a problem with this service");
    });

    it("Should throw an internal server error if appointment Id is missing", async () => {
      mockGetOfficerFiling.mockResolvedValue({
        httpStatusCode: 200,
        resource: {
          referenceEtag: "ETAG",
          resignedOn: "2008-08-08"
        }
      });
      const response = await request(app).get(SUBMITTED_URL);
      expect(response.text).toContain("Sorry, there is a problem with this service");
    });
  });
});
