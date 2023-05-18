jest.mock("../../src/utils/logger");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/confirm.company.service");
jest.mock("../../src/utils/date");
jest.mock("../../src/services/stop.page.validation.service");
jest.mock("../../src/validation/request.input.validation");


import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { CONFIRM_COMPANY_PATH, SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM, urlParams } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile, dissolvedCompanyProfile } from "../mocks/company.profile.mock";
import { formatForDisplay } from "../../src/services/confirm.company.service";
import { getCurrentOrFutureDissolved } from "../../src/services/stop.page.validation.service";
import { isValidUrl } from "../../src/validation/request.input.validation";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockFormatForDisplay = formatForDisplay as jest.Mock;
const mockGetCurrentOrFutureDissolved = getCurrentOrFutureDissolved as jest.Mock;
const mockIsValidUrl = isValidUrl as jest.Mock;

const companyNumber = "12345678";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with this service";

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";
  const DISSOLVED_PAGE_REDIRECT_HEADING = "Found. Redirecting to /officer-filing-web/stop-page?companyNumber=12345678"

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentOrFutureDissolved.mockReset();
    mockIsValidUrl.mockReset();
  });

  it("Should navigate to confirm company page", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockFormatForDisplay.mockReturnValueOnce(validCompanyProfile);
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);
    mockIsValidUrl.mockReturnValueOnce(true);

    const response = await request(app)
    .get(CONFIRM_COMPANY_PATH)
    .query({ companyNumber });

    expect(response.text).toContain(PAGE_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should populate the template with CompanyProfile data", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockFormatForDisplay.mockReturnValueOnce(validCompanyProfile);
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);
    mockIsValidUrl.mockReturnValueOnce(true);

    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain(validCompanyProfile.companyNumber);
    expect(response.text).toContain(validCompanyProfile.companyName);
  });

  it("Should return error page if error is thrown when getting Company Profile", async () => {
    const message = "Can't connect";
    mockGetCompanyProfile.mockRejectedValueOnce(new Error(message));

    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
  });

  it("Should call private sdk client and redirect to transaction using company number in profile retrieved from database", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);
    mockIsValidUrl.mockReturnValueOnce(true);

    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);
      
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/officer-filing-web/company/" + companyNumber + "/transaction");
  });

  it("Should redirect to dissolved stop screen when company is dissolved", async () => {
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(true);
    mockIsValidUrl.mockReturnValueOnce(true);

    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);

    expect(response.text).toEqual(DISSOLVED_PAGE_REDIRECT_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should return error page if error is url is invalid", async () => {
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);
    mockIsValidUrl.mockReturnValueOnce(false);

    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);

    expect(response.text).toContain(SERVICE_UNAVAILABLE_TEXT);
  });
});

