import { Resource } from "@companieshouse/api-sdk-node";
import { logger, createAndLogError } from "../utils/logger";
import { Session } from "@companieshouse/node-session-handler";
import { createPrivateOAuthApiClient } from "./api.service";
import ApiClient from "private-api-sdk-node/dist/client"
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";

/**
 * Get company appointment full record from the company appointments API
 * @param companyNumber The company number that the officer belongs to
 * @param appointmentId The ID of the officer
 * @returns The retrieved company appointment
 */
export const getCompanyAppointmentFullRecord = async (session: Session, companyNumber: string, appointmentId: string): Promise<CompanyAppointment> => {
  const apiClient: ApiClient = createPrivateOAuthApiClient(session);

  logger.debug(`Looking for company appointment with appointment ID ${appointmentId}`);
  const sdkResponse: Resource<CompanyAppointment> = await apiClient.companyAppointments.getCompanyAppointmentFullRecord(companyNumber, appointmentId); 

  if (!sdkResponse) {
    throw createAndLogError(`Company Appointments API returned no response for appointment ID ${appointmentId}`);
  }

  if (sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company appointment with id ${appointmentId}`);
  }

  if (!sdkResponse.resource) {
    throw createAndLogError(`Company Appointments API returned no resource for appointment ID ${appointmentId}`);
  }

  logger.debug(`Received company appointment ${JSON.stringify(sdkResponse)}`);

  if (sdkResponse.resource.isSecureOfficer) {
    obfuscateResidentialAddress(sdkResponse.resource);
  }

  return sdkResponse.resource;
};

const obfuscateResidentialAddress = (resource: CompanyAppointment) => {
  const obfuscatedPattern = "********";
  resource.usualResidentialAddress = {
    addressLine1: obfuscatedPattern,
    addressLine2: obfuscatedPattern,
    country: obfuscatedPattern,
    locality: obfuscatedPattern,
    poBox: obfuscatedPattern,
    postalCode: obfuscatedPattern,
    premises: obfuscatedPattern,
    region: obfuscatedPattern,
  }
}
