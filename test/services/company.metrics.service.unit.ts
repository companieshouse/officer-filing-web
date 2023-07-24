jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/date");
jest.mock("../../src/utils/api.enumerations");

import { getCompanyProfile } from "../../src/services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../src/utils/logger";
import { validSDKResource } from "../mocks/company.profile.mock";
import { MetricsApi } from "@companieshouse/api-sdk-node/dist/services/company-metrics/types";
import { getCompanyMetrics } from "../../src/services/company.metrics.service";

const mockCreateApiClient = createApiClient as jest.Mock;
const mockGetCompanyMetrics = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreateApiClient.mockReturnValue({
  companyMetrics: {
    getCompanyMetrics: mockGetCompanyMetrics
  }
});

mockCreateAndLogError.mockReturnValue(new Error());

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Company metrics service test", () => {
  const COMPANY_NUMBER = "1234567";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCompanyMetrics tests", () => {
    it("Should return company metrics", async () => {
      mockGetCompanyMetrics.mockResolvedValueOnce(clone(validSDKResource));
      const returnedMetrics: MetricsApi = await getCompanyMetrics(COMPANY_NUMBER);

      Object.getOwnPropertyNames(validSDKResource.resource).forEach(property => {
        expect(returnedMetrics).toHaveProperty(property);
      });
    });

    it("Should throw an error if status code >= 400", async () => {
      const HTTP_STATUS_CODE = 400;
      mockGetCompanyMetrics.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<MetricsApi>);

      await getCompanyMetrics(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error if no response returned from SDK", async () => {
      mockGetCompanyMetrics.mockResolvedValueOnce(undefined);

      await getCompanyMetrics(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no response"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });

    it("Should throw an error if no response resource returned from SDK", async () => {
      mockGetCompanyMetrics.mockResolvedValueOnce({} as Resource<MetricsApi>);

      await getCompanyMetrics(COMPANY_NUMBER)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no resource"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${COMPANY_NUMBER}`));
        });
    });
  });
});
