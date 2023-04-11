jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/active.directors.details.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";


import { ACTIVE_DIRECTORS_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { mockCompanyOfficers } from "../mocks/active.director.details.mock";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getListActiveDirectorDetails } from "../../src/services/active.directors.details.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyOfficers = getListActiveDirectorDetails as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyOfficers.mockResolvedValue(mockCompanyOfficers);
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Test Company";
// const EXPECTED_ERROR_TEXT = "Error retrieving active director details";
const ACTIVE_DIRECTOR_DETAILS_URL = ACTIVE_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);

describe("Active directors controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockSessionMiddleware.mockClear();
    mockGetCompanyOfficers.mockClear();
    mockGetCompanyProfile.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to current directors page", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display active non-corporate directors", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("JANE");
      expect(response.text).toContain("SMITH");
      expect(response.text).toContain("Director");
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("December 2001");
      expect(response.text).toContain("Appointed on");
      expect(response.text).toContain("11 May 2019");

    });

    it("Should display corporate-directors", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("Test Company (12345678)");
      expect(response.text).toContain("Director");
      expect(response.text).toContain("Appointed on");
      expect(response.text).toContain("3 November 2020");
    });

    // it("Should navigate to an error page if the called service throws an error", async () => {
    //     mockGetCompanyOfficers.mockImplementationOnce(() => { throw new Error(); });

    //   const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

    //   expect(response.text).toContain(EXPECTED_ERROR_TEXT);
    // });
  });

  describe("post tests", () => {
  });
});
