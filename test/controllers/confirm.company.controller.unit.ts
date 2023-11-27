jest.mock("../../src/utils/logger");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/company.metrics.service");
jest.mock("../../src/services/confirm.company.service");
jest.mock("../../src/utils/date");
jest.mock("../../src/services/stop.page.validation.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile, overseaCompanyCompanyProfile } from "../mocks/company.profile.mock";
import { formatForDisplay } from "../../src/services/confirm.company.service";
import { getCurrentOrFutureDissolved } from "../../src/services/stop.page.validation.service";
import { getCompanyMetrics } from "../../src/services/company.metrics.service";
import { companyMetrics, companyMetricsNoDirectors } from "../mocks/company.metrics.mock";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockFormatForDisplay = formatForDisplay as jest.Mock;
const mockGetCurrentOrFutureDissolved = getCurrentOrFutureDissolved as jest.Mock;
const mockGetCompanyMetrics = getCompanyMetrics as jest.Mock;

const companyNumber = "12345678";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with this service";

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";
  const DISSOLVED_PAGE_REDIRECT_HEADING = "Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=dissolved&lang=en";
  const LIMITED_UNLIMITED_PAGE_REDIRECT_HEADING = "Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=limited-unlimited&lang=en";
  const NO_DIRECTORS_PAGE_REDIRECT_HEADING = "Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=no%20directors&lang=en";

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentOrFutureDissolved.mockReset();
  });

  it("Should navigate to confirm company page", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockFormatForDisplay.mockReturnValueOnce(validCompanyProfile);
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);

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

    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.text).toContain(validCompanyProfile.companyNumber);
    expect(response.text).toContain(validCompanyProfile.companyName);
  });

  it("Should render the page in welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockFormatForDisplay.mockReturnValueOnce(validCompanyProfile);
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);

    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH + "?lang=cy");

    expect(response.text).toContain("Cadarnhau mai hwn yw&#39;r cwmni cywir");
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
    mockGetCompanyMetrics.mockResolvedValueOnce(companyMetrics);
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);

    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);
      
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/appoint-update-remove-company-officer/company/" + companyNumber + "/transaction?lang=en");
  });

  it("Should redirect to dissolved stop screen when company is dissolved", async () => {
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(true);

    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);

    expect(response.text).toEqual(DISSOLVED_PAGE_REDIRECT_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should redirect to non limited-unlimited stop screen when company is not limited or unlimited type", async () => {
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);
    mockGetCompanyProfile.mockResolvedValueOnce(overseaCompanyCompanyProfile);

    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);

    expect(response.text).toEqual(LIMITED_UNLIMITED_PAGE_REDIRECT_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should redirect to no directors stop screen when company has no active directors", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockGetCompanyMetrics.mockResolvedValueOnce(companyMetricsNoDirectors)

    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);

    expect(response.text).toEqual(NO_DIRECTORS_PAGE_REDIRECT_HEADING);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("Should redirect allowing lang to be specified as welsh", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockGetCompanyMetrics.mockResolvedValueOnce(companyMetrics);
    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);

    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber + "&lang=cy");

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/appoint-update-remove-company-officer/company/" + companyNumber + "/transaction?lang=cy");
  });
});

