import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import { OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const getCurrentOrFutureDissolved = async (session: Session, companyNumber: string): Promise<boolean> => {
    const client = createPublicOAuthApiClient(session);
    const ofService: OfficerFilingService = client.officerFiling;
    const response: Resource<boolean> | ApiErrorResponse = await ofService.getCurrentOrFutureDissolved(companyNumber);
    const status = response.httpStatusCode as number;

    if (status >= 400) {
      const errorResponse = response as ApiErrorResponse;
      throw new Error(`Error retrieving company information: ${JSON.stringify(errorResponse)}`);
    }
    const successfulResponse = response as Resource<boolean>;
    return successfulResponse.resource as boolean;
}
