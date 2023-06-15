jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/active.directors.details.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/utils/api.enumerations");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { ACTIVE_DIRECTORS_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";
import { mockCompanyOfficerMissingAppointedOn, mockCompanyOfficersExtended } from "../mocks/active.director.details.mock";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { getListActiveDirectorDetails } from "../../src/services/active.directors.details.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyOfficers = getListActiveDirectorDetails as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyOfficers.mockResolvedValue(mockCompanyOfficersExtended);
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const COMPANY_NUMBER = "12345678";
const PAGE_HEADING = "Test Company";
const ACTIVE_DIRECTOR_DETAILS_URL = ACTIVE_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER);
const NO_DIRECTORS_REDIRECT = "Found. Redirecting to /officer-filing-web/company/12345678/stop-page?stopType=no%20directors";

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

    it("Should navigate to current directors paginated pages", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL + "?page=2");

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display active non-corporate directors", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("JANE");
      expect(response.text).toContain("ALICE");
      expect(response.text).toContain("SMITH");
      expect(response.text).toContain("Director");
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("December 2001");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("11 May 2019");
    });

    it("Should display active non-corporate nominee directors", async () => {
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);
  
        expect(mockGetCompanyOfficers).toHaveBeenCalled();
        expect(response.text).toContain("BETTY");
        expect(response.text).toContain("WHITE");
        expect(response.text).toContain("Director");
        expect(response.text).toContain("Date of birth");
        expect(response.text).toContain("December 2001");
        expect(response.text).toContain("Date appointed");
        expect(response.text).toContain("1 April 2016");
      });

    it("Should display active corporate directors", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL + "?page=2");

      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("BIG CORP");
      expect(response.text).toContain("Director");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("3 November 2020");
    });

    it("Should display active corporate nominee directors", async () => {
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL + "?page=2");
  
        expect(mockGetCompanyOfficers).toHaveBeenCalled();
        expect(response.text).toContain("BIGGER CORP 2");
        expect(response.text).toContain("Director");
        expect(response.text).toContain("Date appointed");
        expect(response.text).toContain("13 August 2022");
      });

      it("Should display a maximum of 5 directors on a page", async () => {
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mockGetCompanyOfficers).toHaveBeenCalled();
        expect(response.text.match(/Remove director/g) || []).toHaveLength(5);
      });  

      it("Should redirect to no directors page if no officers are returned", async () => {
        mockGetCompanyOfficers.mockResolvedValue([]);
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);
        expect(response.text).toContain(NO_DIRECTORS_REDIRECT);
      }); 

      it("Should show appointed before 1992 if appointed on date is missing", async () => {
        mockGetCompanyOfficers.mockResolvedValue([mockCompanyOfficerMissingAppointedOn]);
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);
        expect(response.text).toContain("Date appointed");
        expect(response.text).toContain("Before 1992");
      }); 
  });
});
