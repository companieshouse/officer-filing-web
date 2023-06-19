jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/remove.directors.check.answers.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { REMOVE_DIRECTOR_SUBMITTED_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { mockCompanyOfficer, mockCompanyOfficerMissingResignedOn } from "../mocks/remove.director.check.answers.mock";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getDirectorAndTerminationDate } from "../../src/services/remove.directors.check.answers.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetDirectorAndTerminationDate = getDirectorAndTerminationDate as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetDirectorAndTerminationDate.mockResolvedValue(mockCompanyOfficer);
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Removal of director submitted";
const WHAT_HAPPENS_NEXT = "We'll send a confirmation email to you which contains your reference number."
const FEEDBACK = "This is a new service. Help us improve it by completing our";
const SUBMITTED_URL = REMOVE_DIRECTOR_SUBMITTED_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Remove director submitted controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetDirectorAndTerminationDate.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to removal of director submitted page", async () => {
      const response = await request(app).get(SUBMITTED_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display removal summary for the director", async () => {
      const response = await request(app).get(SUBMITTED_URL);

      expect(mockGetDirectorAndTerminationDate).toHaveBeenCalled();
      expect(mockGetCompanyProfile).toHaveBeenCalled();
      expect(response.text).toContain("Company name");
      expect(response.text).toContain("Test Company");
      expect(response.text).toContain("Company number");
      expect(response.text).toContain("12345678");
      expect(response.text).toContain("Name of director");
      expect(response.text).toContain("JOHN MiddleName DOE");
      expect(response.text).toContain("Date removed");
      expect(response.text).toContain("4 December 2022");
    });

    it("Should display required subtitles & information", async () => {
      const response = await request(app).get(SUBMITTED_URL);

      expect(mockGetDirectorAndTerminationDate).toHaveBeenCalled();
      expect(mockGetCompanyProfile).toHaveBeenCalled();

      expect(response.text).toContain("What happens next");
      expect(response.text).toContain(WHAT_HAPPENS_NEXT);
      expect(response.text).toContain("What do you want to do next?");
      expect(response.text).toContain("Feedback");
      expect(response.text).toContain(FEEDBACK);
    });    
  
    it("Should throw an internal server error if resigned on date is missing", async () => {
      mockGetDirectorAndTerminationDate.mockResolvedValue(mockCompanyOfficerMissingResignedOn);
      const response = await request(app).get(SUBMITTED_URL);
      expect(response.text).toContain("Sorry, there is a problem with this service");
    });
  });
});
