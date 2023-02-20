import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import {
  ActiveOfficerDetails,
  ConfirmationStatementService
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const getActiveOfficerDetailsData = async (session: Session, transactionId: string, submissionId: string): Promise<ActiveOfficerDetails> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<ActiveOfficerDetails> | ApiErrorResponse = await csService.getActiveOfficerDetails(transactionId, submissionId);
  const status = response.httpStatusCode as number;

  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error(`Error retrieving active director details: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<ActiveOfficerDetails>;
  return successfulResponse.resource as ActiveOfficerDetails;
};
