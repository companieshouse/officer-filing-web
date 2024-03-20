import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile, RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CHS_API_KEY } from "../utils/properties";
import { logger, createAndLogError } from "../utils/logger";

export const getCompanyProfile = async (companyNumber: string): Promise<CompanyProfile> => {
  const apiClient = createApiClient(CHS_API_KEY);

  logger.debug(`Looking for company profile with company number ${companyNumber}`);
  const sdkResponse: Resource<CompanyProfile> = await apiClient.companyProfile.getCompanyProfile(companyNumber);

  if (!sdkResponse) {
    throw createAndLogError(`Company Profile API returned no response for company number ${companyNumber}`);
  }

  if (sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company profile for company number ${companyNumber}`);
  }

  if (!sdkResponse.resource) {
    throw createAndLogError(`Company Profile API returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received company profile ${JSON.stringify(sdkResponse)}`);

  return sdkResponse.resource;
};

export const mapCompanyProfileToOfficerFilingAddress = (registeredOffice: RegisteredOfficeAddress) => {
  if (!registeredOffice) {
    return; 
  }
  return {
    addressLine1: registeredOffice.addressLineOne,
    addressLine2: registeredOffice.addressLineTwo,
    country: registeredOffice.country,
    locality: registeredOffice.locality,
    poBox: registeredOffice.poBox,
    postalCode: registeredOffice.postalCode,
    premises: registeredOffice.premises,
    region: registeredOffice.region
  } 
}
