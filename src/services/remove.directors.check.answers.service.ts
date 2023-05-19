import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import {
  CompanyOfficer,
  OfficerFilingService
} from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const getDirectorAndTerminationDate = async (session: Session, transactionId: string, submissionId: string): Promise<CompanyOfficer> => {
  const client = createPublicOAuthApiClient(session);
  const ofService: OfficerFilingService = client.officerFiling;
  const response: Resource<CompanyOfficer[]> | ApiErrorResponse = await ofService.getDirectorAndTerminationDate(transactionId, submissionId);
  const status = response.httpStatusCode as number;

  if (status >= 400) {
    const errorResponse = response;
    throw new Error(`Error retrieving TM01 check your answers details: ${JSON.stringify(errorResponse)}`);
  }
  const successfulResponse = response as Resource<CompanyOfficer>;
  return successfulResponse.resource as CompanyOfficer;
};
