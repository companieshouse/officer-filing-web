jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/confirm.company.service");
jest.mock("../../src/utils/date");

import request from "supertest";
import app from "../../src/app";
import {
  CONFIRM_COMPANY_PATH
} from "../../src/types/page.urls";
import mocks from "../mocks/all.middleware.mock";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { Settings as luxonSettings } from "luxon";
import { formatForDisplay } from "../../src/services/confirm.company.service";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockFormatForDisplay = formatForDisplay as jest.Mock;

const companyNumber = "12345678";
const today = "2020-04-25";
const SERVICE_UNAVAILABLE_TEXT = "Sorry, there is a problem with this service";

describe("Confirm company controller tests", () => {
  const PAGE_HEADING = "Confirm this is the correct company";

  beforeEach(() => {
    jest.clearAllMocks();
    luxonSettings.now = () => new Date(today).valueOf();
  });

  it("Should navigate to confirm company page", async () => {
    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
    expect(response.text).toContain(PAGE_HEADING);
  });

  it("Should pass the company number to the company profile service", async () => {
    await request(app)
      .get(CONFIRM_COMPANY_PATH)
      .query({ companyNumber });

    expect(mockGetCompanyProfile).toHaveBeenCalledWith(companyNumber);
  });

  it("Should populate the template with CompanyProfile data", async () => {
    mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
    mockFormatForDisplay.mockReturnValueOnce(validCompanyProfile);

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
    const response = await request(app)
      .post(CONFIRM_COMPANY_PATH + "?companyNumber=" + companyNumber);
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/officer-filing-web/company/" + companyNumber + "/transaction");
  });

});
