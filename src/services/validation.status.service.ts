import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import { ValidationStatusResponse, OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { logger } from "../utils/logger";

export const getValidationStatus = async (session: Session, transactionId: string, submissionId: string): Promise<ValidationStatusResponse> => {
    const client = createPublicOAuthApiClient(session);
    const ofService: OfficerFilingService = client.officerFiling;
    const response: Resource<ValidationStatusResponse> | ApiErrorResponse = await ofService.getValidationStatus(transactionId, submissionId);
    const status = response.httpStatusCode as number;

    if (status >= 400) {
      const errorResponse = response as ApiErrorResponse;
      throw new Error(`Error retrieving validation status: ${JSON.stringify(errorResponse)}`);
    }
    const successfulResponse = response as Resource<ValidationStatusResponse>;
    return logValidationErrors(successfulResponse.resource as ValidationStatusResponse);
}

const logValidationErrors = (validationStatus: ValidationStatusResponse): ValidationStatusResponse => {
    if (!validationStatus.isValid) {
      logger.error("Validation errors: " + JSON.stringify(validationStatus.errors.slice(0, 10)));
    }
    return validationStatus;
}
