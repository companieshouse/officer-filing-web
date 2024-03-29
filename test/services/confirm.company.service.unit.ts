jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/date");
jest.mock("../../src/utils/api.enumerations");

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createApiClient } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../src/utils/logger";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { toReadableFormat } from "../../src/utils/date";
import { buildAddress, formatForDisplay } from "../../src/services/confirm.company.service";
import { add } from "winston";
import { getLocalesService } from "../../src/utils/localise";
import { get } from "http";

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyProfile = jest.fn();
const mockToReadableFormat = toReadableFormat as jest.Mock;
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

const localeServices = getLocalesService();

  describe("formatForDisplay tests", () => {
    it("Should convert dates into a readable format", () => {
      const formattedDate = "15 April 2019";
      mockToReadableFormat.mockReturnValue(formattedDate);
      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile), getLocalesService(), "en");

      expect(mockToReadableFormat.mock.calls[0][0]).toEqual(validCompanyProfile.dateOfCreation);
      expect(formattedCompanyProfile.dateOfCreation).toEqual(formattedDate);
    });

    it("Should convert company type into readable format", () => {
      const formattedCompanyType = "Private limited company";
      
      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile), getLocalesService(), "en");

      expect(formattedCompanyProfile.type).toEqual(formattedCompanyType);
    });

    it("Should convert company status into readable format", () => {
      const formattedCompanyStatus = "Active";

      const formattedCompanyProfile: CompanyProfile = formatForDisplay(clone(validCompanyProfile), getLocalesService(), "en");

      expect(formattedCompanyProfile.companyStatus).toEqual(formattedCompanyStatus);
    });

    
});

    describe("buildAddress tests", () => {
      it("Should produce HTML splitting the address entries one per line", () => {
      const address = buildAddress(new Array("Line1", "Line2", "Line3"));
      expect(address).toEqual("Line1<br>Line2<br>Line3<br>")
    });
});
