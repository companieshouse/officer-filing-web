jest.mock("../../src/services/company.profile.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM, urlParams } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { dissolvedCompanyProfile, overseaCompanyCompanyProfile } from "../mocks/company.profile.mock";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with this service";
const SHOW_STOP_PAGE_PATH_URL = "/officer-filing-web/stop-page?companyNumber=12345678&stopType=";
const SHOW_STOP_PAGE_PATH_URL_DISSOLVED = SHOW_STOP_PAGE_PATH_URL + "dissolved";
const SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED = SHOW_STOP_PAGE_PATH_URL + "limited-unlimited";

describe("Stop screen controller tests", () => {
  const DISSOLVED_PAGE_HEADING = "Company is dissolved or in the process of being dissolved";
  const dissolvedPageBodyText = "cannot use this service because it has been dissolved, or it's in the process of being dissolved."
  const NON_LIMITED_UNLIMITED_PAGE_HEADING = "Only limited and unlimited companies can use this service";
  const nonLimitedUnlimitedPageBodyText = "You can only file director updates for Test Company using this service if it's a:"

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should navigate to dissolved stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);
    
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);
    expect(response.text).toContain(DISSOLVED_PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should set the content to dissolved company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);

    expect(response.text).toContain(DISSOLVED_PAGE_HEADING);
    expect(response.text).toContain(dissolvedCompanyProfile.companyName);
    expect(response.text).toContain(dissolvedPageBodyText);
  });

  it("Should navigate to non limited-unlimited stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);
    
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);
    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should set the content to non limited-unlimited company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);

    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_HEADING);
    expect(response.text).toContain(overseaCompanyCompanyProfile.companyName);
    expect(response.text).toContain(nonLimitedUnlimitedPageBodyText);
  });

  it("Should return error page if error is thrown when getting Company Profile", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH);

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
  });

});

