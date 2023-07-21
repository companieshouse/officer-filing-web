import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { MetricsApi } from "@companieshouse/api-sdk-node/dist/services/company-metrics/types";
import { CHS_API_KEY } from "../utils/properties";
import { logger, createAndLogError } from "../utils/logger";

export const getCompanyMetrics = async (companyNumber: string): Promise<MetricsApi> => {
  const apiClient = createApiClient(CHS_API_KEY);

  logger.debug(`Looking for company metrics for company number ${companyNumber}`);
  const sdkResponse: Resource<MetricsApi> = await apiClient.companyMetrics.getCompanyMetrics(companyNumber);

  if (!sdkResponse) {
    throw createAndLogError(`Company Metrics API returned no response for company number ${companyNumber}`);
  }

  if (sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company metrics for company number ${companyNumber}`);
  }

  if (!sdkResponse.resource) {
    throw createAndLogError(`Company Metrics API returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received company metrics ${JSON.stringify(sdkResponse)}`);

  return sdkResponse.resource;
};
