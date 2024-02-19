jest.mock("../../src/services/company.profile.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { dissolvedCompanyProfile, dissolvedMissingNameCompanyProfile, overseaCompanyCompanyProfile, overseaCompanyMissingNameCompanyProfile, validCompanyProfile } from "../mocks/company.profile.mock";
import { BASIC_STOP_PAGE_PATH } from "../../src/types/page.urls";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with this service";
const SHOW_STOP_PAGE_PATH_URL = "/appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=";
const SHOW_STOP_PAGE_PATH_URL_DISSOLVED = SHOW_STOP_PAGE_PATH_URL + "dissolved";
const SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED = SHOW_STOP_PAGE_PATH_URL + "limited-unlimited";
const SHOW_STOP_PAGE_PATH_URL_PRE_OCT_2009 = SHOW_STOP_PAGE_PATH_URL + "pre-october-2009";
const SHOW_STOP_PAGE_PATH_URL_ETAG = SHOW_STOP_PAGE_PATH_URL + "etag";
const SHOW_STOP_PAGE_PATH_URL_SOMETHING_WENT_WRONG = SHOW_STOP_PAGE_PATH_URL + "something-went-wrong";
const DISSOLVED_PAGE_HEADING = "Company is dissolved or in the process of being dissolved";
const DISSOLVED_PAGE_BODY_TEXT = "cannot use this service because it has been dissolved, or it's in the process of being dissolved.";
const NON_LIMITED_UNLIMITED_PAGE_HEADING = "Only limited and unlimited companies can use this service";
const NON_LIMITED_UNLIMITED_PAGE_BODY_TEXT = "You can only file director updates for Test Company using this service if it's a:";
const PRE_OCTOBER_2009_PAGE_HEADING = "You cannot use this service";
const PRE_OCTOBER_2009_PAGE_BODY_TEXT = "The date the director was removed is before 1 October 2009."
const ETAG_PAGE_HEADING = "Someone has already made updates for this director";
const ETAG_PAGE_BODY_TEXT = "Since you started using this service, someone else has submitted an update to this director's details."
const SOMETHING_WENT_WRONG_HEADING = "Something went wrong";
const SOMETHING_WENT_WRONG_BODY_TEXT= "<p>You need to <a href=\"/appoint-update-remove-company-officer\" data-event-id=\"start-the-service-again-link\">start the service again</a>.</p>";

describe("Stop screen controller tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCompanyProfile.mockClear();
  });

  it("Should navigate to dissolved stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);
    
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);
    expect(response.text).toContain(DISSOLVED_PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should set the content to dissolved company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);

    expect(response.text).toContain(DISSOLVED_PAGE_HEADING);
    expect(response.text).toContain(dissolvedCompanyProfile.companyName);
    expect(response.text).toContain(DISSOLVED_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to non limited-unlimited stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);

    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should set the content to non limited-unlimited company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);

    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_HEADING);
    expect(response.text).toContain(overseaCompanyCompanyProfile.companyName);
    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to pre-october-2009 stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_PRE_OCT_2009);

    expect(response.text).toContain(PRE_OCTOBER_2009_PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should set the content to pre-october-2009 company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_PRE_OCT_2009);

    expect(response.text).toContain(PRE_OCTOBER_2009_PAGE_HEADING);
    expect(response.text).toContain(PRE_OCTOBER_2009_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should substitute company name for 'This company' for dissolved company missing company name", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedMissingNameCompanyProfile);
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH_URL_DISSOLVED);
    expect(response.text).toContain("This company " + DISSOLVED_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should substitute company name for 'this company' for non limited-unlimited company missing company name", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyMissingNameCompanyProfile);
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH_URL_NON_LIMITED_UNLIMITED);
    expect(response.text).toContain(NON_LIMITED_UNLIMITED_PAGE_BODY_TEXT.replace("Test Company", "this company"));
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();   });

  it("Should return error page if error is thrown when getting Company Profile", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
    const response = await request(app)
      .get(BASIC_STOP_PAGE_PATH);

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
  });

  it("Should return error page if an unknown stop type is provided", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL + "undefined");

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to etag stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_ETAG);

    expect(response.text).toContain(ETAG_PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should set the content to etag company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_ETAG);

    expect(response.text).toContain(ETAG_PAGE_HEADING);
    expect(response.text).toContain(ETAG_PAGE_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

  it("Should navigate to etag stop screen in welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_ETAG + "&lang=cy");

    expect(response.text).toContain("To be translated");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
  });

  it("Should display something-went-wrong stop-screen heading and content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH_URL_SOMETHING_WENT_WRONG);

    expect(response.text).toContain(SOMETHING_WENT_WRONG_HEADING);
    expect(response.text).toContain(SOMETHING_WENT_WRONG_BODY_TEXT);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled(); 
  });

});
