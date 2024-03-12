jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/company.profile.service");
jest.mock("../../../src/services/company.appointments.service");
jest.mock("../../../src/services/officer.filing.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import {
  UPDATE_DIRECTOR_SUBMITTED_PATH,
  urlParams
} from "../../../src/types/page.urls";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { getOfficerFiling } from "../../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { validCompanyProfile } from "../../mocks/company.profile.mock";
import { validCompanyAppointment } from "../../mocks/company.appointment.mock";

const SURVEY_LINK = "https://www.smartsurvey.co.uk/s/directors-conf/"
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetOfficerFiling.mockResolvedValue({
  referenceAppointmentId: "app1",
  referenceEtag: "ETAG",
  resignedOn: "2008-08-08"
});
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointment);
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";

const UPDATE_SUBMITTED_URL = UPDATE_DIRECTOR_SUBMITTED_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const PAGE_HEADING = "Director update submitted";

describe("Director date details controller tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("GET tests", () => {

    it("Should navigate to update submitted page and have hyperlinks", async () => {
      const response = await request(app).get(UPDATE_SUBMITTED_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(TRANSACTION_ID);
      expect(response.text).toContain(SURVEY_LINK);
    });

    it("Should navigate to the update submitted page in Welsh", async () => {
      const response = await request(app).get(UPDATE_SUBMITTED_URL + "?lang=cy");
      expect(response.text).toContain("Mr John Elizabeth Doe");
      expect(response.text).toContain("Diweddariad y cyfarwyddwr wedi ei gyflwyno");
    });

    it("Should display the original name of the director", async () => {
      const response = await request(app).get(UPDATE_SUBMITTED_URL);
      expect(response.text).toContain("Mr John Elizabeth Doe");
    });

    it("Should throw an error is officer filing reference appointment is undefined", async () => {

      mockGetOfficerFiling.mockResolvedValueOnce({
        referenceAppointmentId: undefined,
        referenceEtag: "ETAG",
        resignedOn: "2008-08-08"
      });

      const response = await request(app).get(UPDATE_SUBMITTED_URL);

      expect(response.text).toContain("Sorry, there is a problem with this service");
    });

    it("Should display single dynamic content for update submitted based on officerFiling", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        referenceAppointmentId: "app1",
        referenceEtag: "ETAG",
        nameHasBeenUpdated: true,
        nationalityHasBeenUpdated: false,
        occupationHasBeenUpdated: false,
        residentialAddressHasBeenUpdated: false,
        correspondenceAddressHasBeenUpdated: false,
      });

      const response = await request(app).get(UPDATE_SUBMITTED_URL);

      expect(response.text).toContain("Name");
    });

    it("Should display specific dynamic content for update submitted based on officerFiling", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        referenceAppointmentId: "app1",
        referenceEtag: "ETAG",
        nameHasBeenUpdated: true,
        nationalityHasBeenUpdated: false,
        occupationHasBeenUpdated: false,
        residentialAddressHasBeenUpdated: true,
        correspondenceAddressHasBeenUpdated: true,
      });

      const response = await request(app).get(UPDATE_SUBMITTED_URL);

      expect(response.text).toContain("Name, Home Address, Correspondence Address");
    });

    it("Should display all dynamic content for update submitted based on officerFiling", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        referenceAppointmentId: "app1",
        referenceEtag: "ETAG",
        nameHasBeenUpdated: true,
        nationalityHasBeenUpdated: true,
        occupationHasBeenUpdated: true,
        residentialAddressHasBeenUpdated: true,
        correspondenceAddressHasBeenUpdated: true,
      });

      const response = await request(app).get(UPDATE_SUBMITTED_URL);

      expect(response.text).toContain("Name, Nationality, Occupation, Home Address, Correspondence Address");
    });

  });

});