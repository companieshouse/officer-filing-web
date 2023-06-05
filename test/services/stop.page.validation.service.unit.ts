jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/officer-filing");

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getCurrentOrFutureDissolved } from "../../src/services//stop.page.validation.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";

const mockGetCurrentOrFutureDissolved = OfficerFilingService.prototype.getCurrentOrFutureDissolved as jest.Mock;
const mockCreatePrivateApiClient = createApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  officerFiling: OfficerFilingService.prototype
} as ApiClient);

describe("Test stop page validation service", () => {

  const COMPANY_NUMBER = "12345678";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call api-sdk-node and return true if the company is currently or will be dissolved", async () => {

    const resource: Resource<Boolean> = {
      httpStatusCode: 200,
      resource: true
    };

    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(resource);
    const session =  getSessionRequest();
    const response = await getCurrentOrFutureDissolved(session, COMPANY_NUMBER);

    expect(mockGetCurrentOrFutureDissolved).toBeCalledWith(COMPANY_NUMBER);
    expect(response).toEqual(true);
  });

  it("Should call api-sdk-node and return false if the company is not currently or about to be dissolved", async () => {

    const resource: Resource<Boolean> = {
      httpStatusCode: 200,
      resource: false
    };

    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(resource);
    const session =  getSessionRequest();
    const response = await getCurrentOrFutureDissolved(session, COMPANY_NUMBER);

    expect(mockGetCurrentOrFutureDissolved).toBeCalledWith(COMPANY_NUMBER);
    expect(response).toEqual(false);
  });

  it("should throw error when http error code is returned", async () => {

    const errorMessage = "Oops! Someone stepped on the wire.";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };

    mockGetCurrentOrFutureDissolved.mockReturnValueOnce(errorResponse);
    const session =  getSessionRequest();
    const expectedMessage = "Error retrieving company information: " + JSON.stringify(errorResponse);
    let actualMessage;

    try {
      await getCurrentOrFutureDissolved(session, COMPANY_NUMBER);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});
