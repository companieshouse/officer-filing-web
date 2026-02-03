import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

jest.mock('../../src/utils/properties', () => ({
  SERVICE_WITHDRAWN: "true",
  CHS_URL: "http://chs.com",
  PIWIK_START_GOAL_ID: "3",
  EWF_URL: "https://ewf.companieshouse.gov.uk/",
  TM01_ACTIVE: "true",
  AP01_ACTIVE: "true",
  CH01_ACTIVE: "true",
  COUNTRY_LIST: "England;France",
  UK_COUNTRY_LIST: "England;Scotland;Wales;Northern Ireland;United Kingdom;Cymru",
}));

describe("start controller SERVICE WITHDRAWN tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return start page with Service Withdrawn message", async () => {
    const response = await request(app)
      .get("/appoint-update-remove-company-officer");

    expect(response.text).toContain("You can currently only appoint, remove or update a company director online using our");
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
  });

});