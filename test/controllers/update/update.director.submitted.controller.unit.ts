jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/company.profile.service");
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
import {validCompanyProfile} from "../../mocks/company.profile.mock";
const SURVEY_LINK = "https://www.smartsurvey.co.uk/s/directors-conf/"
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

const UPDATE_SUBMITTED_URL = UPDATE_DIRECTOR_SUBMITTED_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const PAGE_HEADING = "Director update submitted";

describe("Director date details controller tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("GET tests", () => {

    it("Should navigate to update submitted page and have hyperlinks", async () => {
      const response = await request(app).get(UPDATE_SUBMITTED_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(TRANSACTION_ID);
      expect(response.text).toContain(SURVEY_LINK);
    });

    it("Should display single dynamic content for update submitted based on officerFiling", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
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
        nameHasBeenUpdated: true,
        nationalityHasBeenUpdated: false,
        occupationHasBeenUpdated: false,
        residentialAddressHasBeenUpdated: true,
        correspondenceAddressHasBeenUpdated: true,
      });

      const response = await request(app).get(UPDATE_SUBMITTED_URL);

      expect(response.text).toContain("Name, Residential Address, Correspondence Address");
    });

    it("Should display all dynamic content for update submitted based on officerFiling", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        nameHasBeenUpdated: true,
        nationalityHasBeenUpdated: true,
        occupationHasBeenUpdated: true,
        residentialAddressHasBeenUpdated: true,
        correspondenceAddressHasBeenUpdated: true,
      });

      const response = await request(app).get(UPDATE_SUBMITTED_URL);

      expect(response.text).toContain("Name, Nationality, Occupation, Residential Address, Correspondence Address");
    });

  });

});