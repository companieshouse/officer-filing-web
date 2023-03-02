import { createPublicOAuthApiClient } from "./api.service";
import { Session } from "@companieshouse/node-session-handler";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import {
  CompanyValidationResponse,
  ConfirmationStatementService,
  EligibilityStatusCode
} from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const checkEligibility = async (session: Session, companyNumber: string): Promise<EligibilityStatusCode> => {
  const client = createPublicOAuthApiClient(session);
  const csService: ConfirmationStatementService = client.confirmationStatementService;
  const response: Resource<CompanyValidationResponse> = await csService.getEligibility(companyNumber);
  const companyValidationResponse: CompanyValidationResponse = response.resource as CompanyValidationResponse;
  return companyValidationResponse.eligibilityStatusCode;
};
