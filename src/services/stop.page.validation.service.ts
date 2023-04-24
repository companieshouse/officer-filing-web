import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import { OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const getHasCessationDate = async (session: Session, companyNumber: string, transactionId: string): Promise<Boolean> => {
    const client = createPublicOAuthApiClient(session);
    const ofService: OfficerFilingService = client.officerFiling;
    const response: Resource<Boolean> | ApiErrorResponse = await ofService.getHasCessationDate(companyNumber, transactionId);
    const status = response.httpStatusCode as number;

    if (status >= 400) {
      const errorResponse = response as ApiErrorResponse;
      throw new Error(`Error retrieving cessation date: ${JSON.stringify(errorResponse)}`);
    }
    const successfulResponse = response as Resource<Boolean>;
    return successfulResponse.resource as Boolean;
}
