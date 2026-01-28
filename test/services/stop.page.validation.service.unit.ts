jest.mock("../../src/services/company.profile.service");

import { getCompanyProfile } from "../../src/services/company.profile.service";
import { getCurrentOrFutureDissolved } from "../../src/services/stop.page.validation.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";

const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

describe("Test stop page validation service", () => {

  const COMPANY_NUMBER = "12345678";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call getCompanyProfile and return false for valid company profile", async () => {

    mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

    const response = await getCurrentOrFutureDissolved(COMPANY_NUMBER);

    expect(mockGetCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER);
    expect(response).toEqual(false);
  });

  it("Should call getCompanyProfile and return true for dissolved company", async () => {

    mockGetCompanyProfile.mockResolvedValue({ ...validCompanyProfile, companyStatus: "dissolved" });

    const response = await getCurrentOrFutureDissolved(COMPANY_NUMBER);

    expect(mockGetCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER);
    expect(response).toEqual(true);
  });

  it("Should call getCompanyProfile and return true for company with dateOfCessation", async () => {

    mockGetCompanyProfile.mockResolvedValue({ ...validCompanyProfile, dateOfCessation: "2000-01-01" });

    const response = await getCurrentOrFutureDissolved(COMPANY_NUMBER);

    expect(mockGetCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER);
    expect(response).toEqual(true);
  });

  it("Should call getCompanyProfile and return true for dissolved company with dateOfCessation", async () => {

    mockGetCompanyProfile.mockResolvedValue({ ...validCompanyProfile, companyStatus: "dissolved", dateOfCessation: "2000-01-01" });

    const response = await getCurrentOrFutureDissolved(COMPANY_NUMBER);

    expect(mockGetCompanyProfile).toHaveBeenCalledWith(COMPANY_NUMBER);
    expect(response).toEqual(true);
  });
});
