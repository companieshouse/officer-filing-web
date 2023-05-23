jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/api.service");
jest.mock("../../src/utils/logger");

import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "../../src/services/api.service";
import { createAndLogError } from "../../src/utils/logger";
import { postOfficerFiling } from "../../src/services/officer.filing.service";
import { FilingResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostOfficerFiling = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreatePublicOAuthApiClient.mockReturnValue({
  officerFiling: {
    postOfficerFiling: mockPostOfficerFiling
  }
});

const ERROR: Error = new Error("oops");
mockCreateAndLogError.mockReturnValue(ERROR);

let session: any;
const TRANSACTION_ID = "2222";
const APPOINTMENT_ID = "987";
const COMPANY_NUMBER = "12345678";
const SUBMISSION_ID = "764347373";

describe("officer filing service tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  describe("postOfficerFiling tests", () => {

    it("Should successfully post a transaction", async() => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: {
          submissionId: SUBMISSION_ID,
          name: "name"
        }
      });
      const filingResponse: FilingResponse = await postOfficerFiling(session, TRANSACTION_ID, APPOINTMENT_ID);

      expect(filingResponse.submissionId).toEqual(SUBMISSION_ID);
      expect(filingResponse.name).toEqual("name");
    });

    it("Should throw an error when no officer filing api response", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce(undefined);

      await expect(postOfficerFiling(session, TRANSACTION_ID, APPOINTMENT_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Officer filing POST request returned no response for transaction 2222");
    });

    it("Should throw an error when officer filing api returns a status greater than 400", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 404
      });

      await expect(postOfficerFiling(session, TRANSACTION_ID, APPOINTMENT_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Http status code 404 - Failed to post officer filing for transaction 2222");
    });

    it("Should throw an error when officer filing api returns no resource", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200
      });

      await expect(postOfficerFiling(session, TRANSACTION_ID, APPOINTMENT_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Officer filing API POST request returned no resource for transaction 2222");
    });

  });

});
