jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/date");
jest.mock("../../src/utils/api.enumerations");

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createApiClient } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../src/utils/logger";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { toReadableFormat } from "../../src/utils/date";
import { lookupCompanyStatus, lookupCompanyType } from "../../src/utils/api.enumerations";
import { formatForDisplay } from "../../src/services/confirm.company.service";

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyProfile = jest.fn();
const mockToReadableFormat = toReadableFormat as jest.Mock;
const mockLookupCompanyStatus = lookupCompanyStatus as jest.Mock;
const mockLookupCompanyType = lookupCompanyType as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreateApiClient.mockReturnValue({
  companyProfile: {
    getCompanyProfile: mockGetCompanyProfile
  }
});

mockCreateAndLogError.mockReturnValue(new Error());

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

  describe("formatForDisplay tests", () => {
    it("Should convert dates into a readable format", () => {
      const formattedDate = "15 April 2019";
      mockToReadableFormat.mockReturnValue(formattedDate);
      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile));

      expect(mockToReadableFormat.mock.calls[0][0]).toEqual(validCompanyProfile.dateOfCreation);
      expect(formattedCompanyProfile.dateOfCreation).toEqual(formattedDate);
    });

    it("Should convert company type into readable format", () => {
      const formattedCompanyType = "Limited Liability Partnership";
      mockLookupCompanyType.mockReturnValueOnce(formattedCompanyType);
      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile));

      expect(mockLookupCompanyType).toBeCalledWith(validCompanyProfile.type);
      expect(formattedCompanyProfile.type).toEqual(formattedCompanyType);
    });

    it("Should convert company status into readable format", () => {
      const formattedCompanyStatus = "Active";
      mockLookupCompanyStatus.mockReturnValueOnce(formattedCompanyStatus);
      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile));

      expect(mockLookupCompanyStatus).toBeCalledWith(validCompanyProfile.companyStatus);
      expect(formattedCompanyProfile.companyStatus).toEqual(formattedCompanyStatus);
    });
});
