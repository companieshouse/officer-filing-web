import { Resource } from "@companieshouse/api-sdk-node";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createAndLogError, logger } from "../utils/logger";
import { createPublicOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { DESCRIPTION, headers, REFERENCE, transactionStatuses } from "../utils/constants";


export const postTransaction = async (session: Session, companyNumber: string, description: string, reference: string): Promise<Transaction> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  const transaction: Transaction = {
    companyNumber,
    reference,
    description,
  };

  logger.debug(`Creating transaction with company number ${companyNumber}`);
  const sdkResponse: Resource<Transaction> | ApiErrorResponse = await apiClient.transaction.postTransaction(transaction);

  if (!sdkResponse) {
    throw createAndLogError(`Transaction API POST request returned no response for company number ${companyNumber}`);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to post transaction for company number ${companyNumber}`);
  }

  const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

  if (!castedSdkResponse.resource) {
    throw createAndLogError(`Transaction API POST request returned no resource for company number ${companyNumber}`);
  }

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse.resource;
};

export const getTransaction = async (session: Session, transactionId: string): Promise<Transaction> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  logger.debug(`Retrieving transaction with id ${transactionId}`);
  const sdkResponse: Resource<Transaction> | ApiErrorResponse = await apiClient.transaction.getTransaction(transactionId);

  if (!sdkResponse) {
    throw createAndLogError(`Transaction API GET request returned no response for transaction id ${transactionId}`);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get transaction for transaction id ${transactionId}`);
  }

  const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

  if (!castedSdkResponse.resource) {
    throw createAndLogError(`Transaction API GET request returned no resource for transaction id ${transactionId}`);
  }

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse.resource;
};

/**
 * Response can contain a URL to start payment session if payment is needed
 */
export const closeTransaction = async (session: Session, companyNumber: string, confirmationStatementId: string, transactionId: string): Promise<string | undefined> => {
  const apiResponse: ApiResponse<Transaction> = await putTransaction(session, companyNumber, confirmationStatementId, transactionId, DESCRIPTION, transactionStatuses.CLOSED);
  return apiResponse.headers?.[headers.PAYMENT_REQUIRED];
};

/**
 * Response from PUT transaction can contain a URL in header to start payment session if payment is needed
 */
export const putTransaction = async (session: Session,
                                     companyNumber: string,
                                     confirmationStatementId: string,
                                     transactionId: string,
                                     transactionDescription: string,
                                     transactionStatus: string): Promise<ApiResponse<Transaction>> => {
  const apiClient: ApiClient = createPublicOAuthApiClient(session);

  const csReference = `${REFERENCE}_${confirmationStatementId}`;
  const transaction: Transaction = {
    companyNumber,
    description: transactionDescription,
    id: transactionId,
    reference: csReference,
    status: transactionStatus
  };

  logger.debug(`Updating transaction id ${transactionId} with company number ${companyNumber}, status ${transactionStatus}`);
  const sdkResponse: ApiResponse<Transaction> | ApiErrorResponse = await apiClient.transaction.putTransaction(transaction);

  if (!sdkResponse) {
    throw createAndLogError(`Transaction API PUT request returned no response for transaction id ${transactionId}, company number ${companyNumber}`);
  }

  if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
    throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to put transaction for transaction id ${transactionId}, company number ${companyNumber}`);
  }

  const castedSdkResponse: ApiResponse<Transaction> = sdkResponse as ApiResponse<Transaction>;

  logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

  return castedSdkResponse;
};
