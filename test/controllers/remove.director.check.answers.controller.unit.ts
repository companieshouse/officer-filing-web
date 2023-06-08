jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/remove.directors.check.answers.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { mockCompanyOfficer, mockCompanyOfficerMissingDateOfBirth, mockCompanyOfficerMissingDateOfBirthDay, mockCompanyOfficerMissingResignedOn, mockCorporateCompanyOfficer, mockCorporateNomineeCompanyOfficer } from "../mocks/remove.director.check.answers.mock";
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
const PAGE_HEADING = "Test Company";
const CHECK_ANSWERS_URL = REMOVE_DIRECTOR_CHECK_ANSWERS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Remove director check answers controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetDirectorAndTerminationDate.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to current directors page", async () => {
      const response = await request(app).get(CHECK_ANSWERS_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display summary for the non corporate director", async () => {
      const response = await request(app).get(CHECK_ANSWERS_URL);

      expect(mockGetDirectorAndTerminationDate).toHaveBeenCalled();
      expect(response.text).toContain("Company name");
      expect(response.text).toContain("Test Company");
      expect(response.text).toContain("Company number");
      expect(response.text).toContain("12345678");
      expect(response.text).toContain("Name");
      expect(response.text).toContain("JOHN MiddleName DOE");
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("5 November 2002");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("1 December 2022");
      expect(response.text).toContain("Date the director was removed from the company");
      expect(response.text).toContain("4 December 2022");
    });

    it("Should display summary for the corporate directors, missing date of birth", async () => {
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
      mockGetDirectorAndTerminationDate.mockResolvedValue(mockCompanyOfficerMissingDateOfBirth);
      const response = await request(app).get(CHECK_ANSWERS_URL);
      expect(response.text).toContain("Company name");
      expect(response.text).toContain("Test Company");
      expect(response.text).toContain("Company number");
      expect(response.text).toContain("12345678");
      expect(response.text).toContain("Name");
      expect(response.text).toContain("JOHN MiddleName DOE");
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("1 December 2022");
      expect(response.text).toContain("Date the director was removed from the company");
      expect(response.text).toContain("4 December 2022");
    });

    it("Should display date of birth without day if day field is missing", async () => {
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
});
