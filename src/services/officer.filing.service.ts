import { Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError, logger } from "../utils/logger";
import { createPublicOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { OfficerFiling, FilingResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

/**
 * GET an officer filing object with the given transaction ID and submissionId/filingId. 
 * @param session The current session to connect to the api
 * @param transactionId The filings associated transaction ID
 * @param submissionId The only field set on the filing object
 * @returns The Officer Filing
 */
export const getOfficerFiling = async (session: Session, transactionId: string, submissionId: string): Promise<OfficerFiling> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  logger.debug(`Retrieving officer filing for transaction ${transactionId}`);
  const sdkResponse: Resource<OfficerFiling> | ApiErrorResponse = await apiClient.officerFiling.getOfficerFiling(transactionId, submissionId);

  if (!sdkResponse) {
    throw createAndLogError(`Officer filing GET request returned no response for transaction ${transactionId}`);
  }
  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get officer filing for transaction ${transactionId}`);
  }

  const castedSdkResponse: Resource<OfficerFiling> = sdkResponse as Resource<OfficerFiling>;
  if (!castedSdkResponse.resource) {
    throw createAndLogError(`Officer filing API GET request returned no resource for transaction ${transactionId}`);
  }

  logger.debug(`Retrieved Officer Filing ${JSON.stringify(sdkResponse)}`);
  logger.debug(`DEBUG OLAYODE==============OLAYODE Retrieved Officer Filing ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse.resource;
};

/**
 * POST an officer filing object for the given transaction ID. The information within this filing can be built upon using patches.
 * @param session The current session to connect to the api
 * @param transactionId The filings associated transaction ID
 * @param appointmentId The only field set on the filing object
 * @returns The FilingResponse contains the submission ID for the newly created filing
 */
export const postOfficerFiling = async (session: Session, transactionId: string, officerFiling: OfficerFiling): Promise<FilingResponse> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);
  
  logger.debug(`Posting officer filing for transaction ${transactionId}`);
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

  logger.debug(`Posted Officer Filing ${JSON.stringify(sdkResponse)}`);
  return castedSdkResponse.resource;
};

/**
 * PATCH an officer filing object for the given transaction ID and appointment ID. 
 * Only the referenced appointment ID has been set on the filing object, any further information will be sent via a series of patches.
 * @param session The current session to connect to the api
 * @param transactionId The filings associated transaction ID
 * @param appointmentId The only field set on the filing object
 * @returns The FilingResponse contains the submission ID for the newly created filing
 */
export const patchOfficerFiling = async (session: Session, transactionId: string, filingId: string, officerFiling: OfficerFiling): Promise<FilingResponse> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  logger.debug(`Patching officer filing for transaction ${transactionId}`);
  const sdkResponse: Resource<FilingResponse> | ApiErrorResponse = await apiClient.officerFiling.patchOfficerFiling(transactionId, filingId, officerFiling);

  if (!sdkResponse) {
    throw createAndLogError(`Officer filing PATCH request returned no response for transaction ${transactionId}`);
  }
  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to patch officer filing for transaction ${transactionId}`);
  }

  const castedSdkResponse: Resource<FilingResponse> = sdkResponse as Resource<FilingResponse>;
  if (!castedSdkResponse.resource) {
    throw createAndLogError(`Officer filing API PATCH request returned no resource for transaction ${transactionId}`);
  }

  logger.debug(`Patched Officer Filing ${JSON.stringify(sdkResponse)}`);
  return castedSdkResponse.resource;
};
