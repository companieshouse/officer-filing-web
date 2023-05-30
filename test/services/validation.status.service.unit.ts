jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/officer-filing");

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ValidationStatusResponse, OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { mockValidationStatusResponse } from "../mocks/validation.status.response.mock";

const mockGetValidationStatus = OfficerFilingService.prototype.getValidationStatus as jest.Mock;
const mockCreatePrivateApiClient = createApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  officerFiling: OfficerFilingService.prototype
} as ApiClient);

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test validation status service", () => {

  const TRANSACTION_ID = "66454";
  const SUBMISSION_ID = "9879868678";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call the sdk and get the validation status response", async () => {

    const resource: Resource<ValidationStatusResponse> = {
      httpStatusCode: 200,
      resource: mockValidationStatusResponse
    };

    mockGetValidationStatus.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getValidationStatus(session, TRANSACTION_ID, SUBMISSION_ID);

    expect(mockGetValidationStatus).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID);
    expect(response).toEqual(mockValidationStatusResponse);
  });

  it("should throw error when http error code is returned", async () => {

    const errorMessage = "Oops! Someone stepped on the wire.";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };

    mockGetValidationStatus.mockReturnValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving validation status: " + JSON.stringify(errorResponse);
    let actualMessage;

    try {
      await getValidationStatus(session, TRANSACTION_ID, SUBMISSION_ID);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});
