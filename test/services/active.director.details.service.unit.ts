jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/officer-filing");

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getListActiveDirectorDetails } from "../../src/services/active.directors.details.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyOfficer, OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { mockCompanyOfficer } from "../mocks/active.director.details.mock";

const mockGetActiveOfficerDetails = OfficerFilingService.prototype.getListActiveDirectorDetails as jest.Mock;
const mockCreatePrivateApiClient = createApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  officerFiling: OfficerFilingService.prototype
} as ApiClient);

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test active director details service", () => {

  const TRANSACTION_ID = "66454";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call the sdk and get the active director details data", async () => {

    const resource: Resource<CompanyOfficer> = {
      httpStatusCode: 200,
      resource: mockCompanyOfficer
    };

    mockGetActiveOfficerDetails.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getListActiveDirectorDetails(session, TRANSACTION_ID);

    expect(mockGetActiveOfficerDetails).toBeCalledWith(TRANSACTION_ID);
    expect(response).toEqual(mockCompanyOfficer);
  });

  it("should throw error when http error code 500 is returned", async () => {

    const errorMessage = "Oops! Someone stepped on the wire.";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 500,
      errors: [{ error: errorMessage }]
    };

    mockGetActiveOfficerDetails.mockReturnValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving active director details: " + JSON.stringify(errorResponse);
    let actualMessage;

    try {
      await getListActiveDirectorDetails(session, TRANSACTION_ID);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });

  it("should return an empty array when no officers are returned", async () => {

    const errorMessage = "404 not found\n{}";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };

    mockGetActiveOfficerDetails.mockReturnValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });

    const response =  await getListActiveDirectorDetails(session, TRANSACTION_ID);

    expect(response.length).toEqual(0);
  });
});
