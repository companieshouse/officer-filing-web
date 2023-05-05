jest.mock("../../src/services/company.profile.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { SHOW_STOP_PAGE, SHOW_STOP_PAGE_PATH } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { dissolvedCompanyProfile } from "../mocks/company.profile.mock";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const companyNumber = "12345678";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with this service";

describe("Stop screen controller tests", () => {
  const DISSOLVED_PAGE_HEADING = "Company is dissolved or it's in the process of being dissolved";
  const dissolvedPageBodyText = "cannot use this service because it has been dissolved, or it's in the process of being dissolved."

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should navigate to dissolved stop screen", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);
    
    const response = await request(app)
    .get(SHOW_STOP_PAGE_PATH)
    .query({ companyNumber });
    expect(response.text).toContain(DISSOLVED_PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should set the content to dissolved company content", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompanyProfile);

    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH);

    expect(response.text).toContain(DISSOLVED_PAGE_HEADING);
    expect(response.text).toContain(dissolvedCompanyProfile.companyName);
    expect(response.text).toContain(dissolvedPageBodyText);
  });

  it("Should return error page if error is thrown when getting Company Profile", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));
    const response = await request(app)
      .get(SHOW_STOP_PAGE_PATH);

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
  });

});

