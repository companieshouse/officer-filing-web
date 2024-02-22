jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/company.profile.service");
jest.mock("../../../src/services/officer.filing.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { getOfficerFiling } from "../../../src/services/officer.filing.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { DIRECTOR_DATE_OF_CHANGE_PATH, UPDATE_DIRECTOR_DETAILS_PATH, urlParams } from "../../../src/types/page.urls";
import { validCompanyProfile } from "../../mocks/company.profile.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";

const PAGE_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const PAGE_URL_WELSH = PAGE_URL + "?lang=cy";
const NEXT_PAGE_URL = DIRECTOR_DATE_OF_CHANGE_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_HEADING = "View and update the director&#39;s details";

describe("Director details tests", () => {

  mockGetOfficerFiling.mockResolvedValue({
    firstName: "JOHN",
    middleNames: "middle",
    lastName: "TesteR",
    title: "Mr",
    nationality1: "Irish",
    nationality2: "American",
    nationality3: "Welsh",
    occupation: "Accountant",
    nameHasBeenUpdated: false,
    occupationHasBeenUpdated: false,
    nationalityHasBeenUpdated: false,
    correspondenceAddressHasBeenUpdated: false,
    residentialAddressHasBeenUpdated: false
  });

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("GET tests", () => {
    it("Should display the update director details page", async () => {
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain("View and update the director&#39;s details");
      expect(response.text).toContain("Director details");
      expect(response.text).toContain("Address details");
    });

    it("Should display the update director details page in Welsh", async () => {
      const response = await request(app).get(PAGE_URL_WELSH);
      expect(response.text).toContain("to be translated");

    });

    it("Should display the details for the active director", async () => {
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("Mr John Middle Tester");
      expect(response.text).toContain("Irish");
      expect(response.text).toContain("American");
      expect(response.text).toContain("Welsh");
      expect(response.text).toContain("Accountant");
      expect(mockGetOfficerFiling).toHaveBeenCalled();
    });

    it("Should catch error if error occurred", async () => {
      mockGetOfficerFiling.mockRejectedValue("Error getting officer filing");
      mockGetCompanyProfile.mockRejectedValue("Error getting company profile");
      const response = await request(app).get(PAGE_URL);
      expect(response.text).not.toContain(PAGE_HEADING);
      expect(response.text).toContain(ERROR_PAGE_HEADING)
    });

  });

  describe("POST tests", () => {
    it("Should redirect to " + DIRECTOR_DATE_OF_CHANGE_PATH + " on submission", async () => {
      const response = await request(app).post(PAGE_URL).send({});
      expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
    })

    it("Should redirect to current directors page when no changes have been made", async () => {
      const response = await request(app)
          .post(PAGE_URL)
          .send({back_to_active_directors: "companyNumber"});

      expect(response.status).toEqual(302);
      expect(response.header.location).toContain(`/appoint-update-remove-company-officer/company/${COMPANY_NUMBER}/transaction/${TRANSACTION_ID}/current-directors`);
    });
  });
});
