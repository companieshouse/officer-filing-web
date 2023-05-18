jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/services/officer-filing");

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getDirectorAndTerminationDate } from "../../src/services/remove.directors.check.answers.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyOfficer, OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { mockCompanyOfficer } from "../mocks/active.director.details.mock";

const mockGetDirectorAndTerminationDate = OfficerFilingService.prototype.getDirectorAndTerminationDate as jest.Mock;
const mockCreatePrivateApiClient = createApiClient as jest.Mock;

mockCreatePrivateApiClient.mockReturnValue({
  officerFiling: OfficerFilingService.prototype
} as ApiClient);

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

describe("Test check your answers service", () => {

  const TRANSACTION_ID = "66454";
  const SUBMISSION_ID = "1236717823";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should call the sdk and get the active director details data", async () => {

    const resource: Resource<CompanyOfficer> = {
      httpStatusCode: 200,
      resource: mockCompanyOfficer
    };

    mockGetDirectorAndTerminationDate.mockReturnValueOnce(resource);
    const session =  getSessionRequest({ access_token: "token" });
    const response = await getDirectorAndTerminationDate(session, TRANSACTION_ID, SUBMISSION_ID);

    expect(mockGetDirectorAndTerminationDate).toBeCalledWith(TRANSACTION_ID, SUBMISSION_ID);
    expect(response).toEqual(mockCompanyOfficer);
  });

  it("should throw error when http error code is returned", async () => {

    const errorMessage = "Oops! Someone stepped on the wire.";
    const errorResponse: ApiErrorResponse = {
      httpStatusCode: 404,
      errors: [{ error: errorMessage }]
    };

    mockGetDirectorAndTerminationDate.mockReturnValueOnce(errorResponse);
    const session =  getSessionRequest({ access_token: "token" });
    const expectedMessage = "Error retrieving TM01 check your answers details: " + JSON.stringify(errorResponse);
    let actualMessage;

    try {
      await getDirectorAndTerminationDate(session, TRANSACTION_ID, SUBMISSION_ID);
    } catch (err) {
      actualMessage = err.message;
    }

    expect(actualMessage).toBeTruthy();
    expect(actualMessage).toEqual(expectedMessage);
  });
});
