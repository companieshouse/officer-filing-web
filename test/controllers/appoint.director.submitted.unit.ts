jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/remove.directors.check.answers.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.appointments.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getOfficerFiling } from "../../src/services/officer.filing.service";
import { APPOINT_DIRECTOR_SUBMITTED_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

mockGetOfficerFiling.mockResolvedValue({
  referenceAppointmentId: "app1",
  referenceEtag: "ETAG",
  resignedOn: "2008-08-08"
});
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Appointment submitted";
const WHAT_HAPPENS_NEXT = "We'll send a confirmation email to you which contains your reference number."
const FEEDBACK = "This is a new service. Help us improve it by completing our";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = APPOINT_DIRECTOR_SUBMITTED_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Appoint director submitted controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
      mockGetCompanyProfile.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to appoint director submitted page", async () => {
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should display the reference number as transaction number", async () => {
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain("Appointment submitted");
        expect(response.text).toContain(TRANSACTION_ID);
      });

      it("Should display removal summary for the director", async () => {

        mockGetOfficerFiling.mockReturnValueOnce({
          firstName: "John",
          middleNames: "Elizabeth",
          lastName: "Doe",
          appointedOn: "08/08/2008"
        })
        const response = await request(app).get(PAGE_URL);

        expect(mockGetCompanyProfile).toHaveBeenCalled();
        expect(mockGetOfficerFiling).toHaveBeenCalled();

        expect(response.text).toContain("Company name");
        expect(response.text).toContain("Test Company");
        expect(response.text).toContain("Company number");
        expect(response.text).toContain("12345678");
        expect(response.text).toContain("Name of director");
        expect(response.text).toContain("John Elizabeth Doe");
        expect(response.text).toContain("Date of appointment");
        expect(response.text).toContain("8 August 2008");
      });

      it("Should display required subtitles & information", async () => {
        const response = await request(app).get(PAGE_URL);

        expect(mockGetCompanyProfile).toHaveBeenCalled();
        expect(mockGetOfficerFiling).toHaveBeenCalled();
        expect(response.text).toContain("What happens next");
        expect(response.text).toContain(WHAT_HAPPENS_NEXT);
        expect(response.text).toContain("What do you want to do next?");
        expect(response.text).toContain("Feedback");
        expect(response.text).toContain(FEEDBACK);
      });

    });

});
