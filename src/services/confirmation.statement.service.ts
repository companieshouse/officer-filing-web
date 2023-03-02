import { Session } from "@companieshouse/node-session-handler";
import Resource, { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createPublicOAuthApiClient } from "./api.service";
import { createAndLogError } from "../utils/logger";
import {
  CompanyValidationResponse,
  ConfirmationStatementCreated,
  ConfirmationStatementService, ConfirmationStatementSubmission, NextMadeUpToDate
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const createConfirmationStatement = async (session: Session,
                                                  transactionId: string): Promise<Resource<ConfirmationStatementCreated | CompanyValidationResponse>> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response = await csService.postNewConfirmationStatement(transactionId);
  if (response.httpStatusCode !== 201 && response.httpStatusCode !== 400) {
    const castedResponse: ApiErrorResponse = response;
    throw new Error(`Something went wrong creating confirmation statement, transactionId = ${transactionId} - ${JSON.stringify(castedResponse)}`);
  } else {
    return response as Resource<ConfirmationStatementCreated | CompanyValidationResponse>;
  }
};

export const getConfirmationStatement = async (session: Session, transactionId: string, confirmationStatementId: string): Promise<ConfirmationStatementSubmission> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response = await csService.getConfirmationStatementSubmission(transactionId, confirmationStatementId);
  const encodedConfirmationStatementId = encodeURIComponent(confirmationStatementId);
  const encodedTransactionId = encodeURIComponent(transactionId);

  if (response.httpStatusCode !== 200) {
    throw new Error(`Error getting confirmation statement from api with confirmationStatementId = ${encodedConfirmationStatementId}, transactionId = ${encodedTransactionId} - ${JSON.stringify(response)}`);
  }

  const csSubmissionResource = response as Resource<ConfirmationStatementSubmission>;
  if (!csSubmissionResource.resource) {
    throw new Error(`Error No resource returned when getting confirmation statement from api with confirmationStatementId = ${encodedConfirmationStatementId}, transactionId = ${encodedTransactionId}`);
  }

  return csSubmissionResource.resource;
};

export const updateConfirmationStatement = async (session: Session,
                                                  transactionId: string,
                                                  submitId: string,
                                                  csSubmission: ConfirmationStatementSubmission) => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response = await csService.postUpdateConfirmationStatement(transactionId, submitId, csSubmission);
  const encodedSubmitId = encodeURIComponent(submitId);
  const encodedTransactionId = encodeURIComponent(transactionId);

  if (response.httpStatusCode !== 200) {
    const castedResponse: ApiErrorResponse = response;
    throw new Error(`Transaction Id ${encodedTransactionId}, Submit Id ${encodedSubmitId}, Something went wrong updating confirmation statement ${JSON.stringify(castedResponse)}`);
  }
};

export const getNextMadeUpToDate = async (session: Session, companyNumber: string): Promise<NextMadeUpToDate> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response = await csService.getNextMadeUpToDate(companyNumber);

  if (response.httpStatusCode !== 200) {
    throw createAndLogError(`Error getting next made up to date from api with company number = ${companyNumber} - ${JSON.stringify(response)}`);
  }

  const nextMadeUpToDate: Resource<NextMadeUpToDate> = response as Resource<NextMadeUpToDate>;
  if (!nextMadeUpToDate.resource) {
    throw createAndLogError(`Error No resource returned when getting next made up to date from api with companyNumber = ${companyNumber} - ${JSON.stringify(response)}`);
  }

  return nextMadeUpToDate.resource;
};
