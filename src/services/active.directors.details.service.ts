import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import {
  ActiveOfficerDetails,
  OfficerFilingService
} from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const getListActiveDirectorDetails = async (session: Session, transactionId: string): Promise<ActiveOfficerDetails[]> => {
  const client = createPublicOAuthApiClient(session);
  const ofService: OfficerFilingService = client.officerFiling;
  const response: Resource<ActiveOfficerDetails[]> | ApiErrorResponse = await ofService.getListActiveDirectorDetails(transactionId);
  const status = response.httpStatusCode as number;

  if (status >= 400) {
    const errorResponse = response as ApiErrorResponse;
    throw new Error(`Error retrieving active director details: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<ActiveOfficerDetails[]>;
  return successfulResponse.resource as ActiveOfficerDetails[];
};
