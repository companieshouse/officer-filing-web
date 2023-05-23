import { Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError, logger } from "../utils/logger";
import { createPublicOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { OfficerFiling, FilingResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";


/**
 * POST an officer filing object for the given transaction ID and appointment ID. 
 * Only the referenced appointment ID has been set on the filing object, any further information will be sent via a series of patches.
 * @param session The current session to connect to the api
 * @param transactionId The filings associated transaction ID
 * @param appointmentId The only field set on the filing object
 * @returns The FilingResponse contains the submission ID for the newly created filing
 */
export const postOfficerFiling = async (session: Session, transactionId: string, appointmentId: string): Promise<FilingResponse> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);
  const officerFiling: OfficerFiling = {
    referenceAppointmentId: appointmentId
  };

  logger.debug(`Posting officer filing for director removal for transaction ${transactionId}`);
  const sdkResponse: Resource<FilingResponse> | ApiErrorResponse = await apiClient.officerFiling.postOfficerFiling(transactionId, officerFiling);

  if (!sdkResponse) {
    throw createAndLogError(`Officer filing POST request returned no response for transaction ${transactionId}`);
  }
  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to post officer filing for transaction ${transactionId}`);
  }

  const castedSdkResponse: Resource<FilingResponse> = sdkResponse as Resource<FilingResponse>;
  if (!castedSdkResponse.resource) {
    throw createAndLogError(`Officer filing API POST request returned no resource for transaction ${transactionId}`);
  }

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);
  return castedSdkResponse.resource;
};
