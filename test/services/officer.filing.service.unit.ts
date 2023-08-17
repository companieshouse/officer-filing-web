jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/api.service");
jest.mock("../../src/utils/logger");

import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "../../src/services/api.service";
import { createAndLogError } from "../../src/utils/logger";
import { getOfficerFiling, patchOfficerFiling, postOfficerFiling } from "../../src/services/officer.filing.service";
import { OfficerFiling, FilingResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockGetOfficerFiling = jest.fn();
const mockPostOfficerFiling = jest.fn();
const mockPatchOfficerFiling = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreatePublicOAuthApiClient.mockReturnValue({
  officerFiling: {
    getOfficerFiling: mockGetOfficerFiling,
    postOfficerFiling: mockPostOfficerFiling,
    patchOfficerFiling: mockPatchOfficerFiling
  }
});

const ERROR: Error = new Error("oops");
mockCreateAndLogError.mockReturnValue(ERROR);

let session: any;
const TRANSACTION_ID = "2222";
const APPOINTMENT_ID = "987";
const SUBMISSION_ID = "764347373";

describe("officer filing service tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  describe("getOfficerFiling tests", () => {

    it("Should successfully get an officerFiling", async() => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: {
          referenceAppointmentId: "app1",
          referenceEtag: "ETAG",
          resignedOn: "2008-08-08"
        }
      });
      const filingResponse: OfficerFiling = await getOfficerFiling(session, TRANSACTION_ID, SUBMISSION_ID);

      expect(filingResponse.referenceAppointmentId).toEqual("app1");
      expect(filingResponse.referenceEtag).toEqual("ETAG");
      expect(filingResponse.resignedOn).toEqual("2008-08-08");
    });

    it("Should throw an error when no officer filing api response", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce(undefined);

      await expect(getOfficerFiling(session, TRANSACTION_ID, SUBMISSION_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Officer filing GET request returned no response for transaction 2222");
    });

    it("Should throw an error when officer filing api returns a status greater than 400", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 404
      });

      await expect(getOfficerFiling(session, TRANSACTION_ID, SUBMISSION_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Http status code 404 - Failed to get officer filing for transaction 2222");
    });

    it("Should throw an error when officer filing api returns no resource", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200
      });

      await expect(getOfficerFiling(session, TRANSACTION_ID, SUBMISSION_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Officer filing API GET request returned no resource for transaction 2222");
    });
  });

  describe("postOfficerFiling tests", () => {

    it("Should successfully post a transaction", async() => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: {
          id: SUBMISSION_ID
        }
      });
      const officerFiling: OfficerFiling = {
        referenceAppointmentId: APPOINTMENT_ID
      };
      const filingResponse: FilingResponse = await postOfficerFiling(session, TRANSACTION_ID, officerFiling);

      expect(filingResponse.id).toEqual(SUBMISSION_ID);
    });

    it("Should throw an error when no officer filing api response", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce(undefined);
      const officerFiling: OfficerFiling = {
        referenceAppointmentId: APPOINTMENT_ID
      };

      await expect(postOfficerFiling(session, TRANSACTION_ID, officerFiling)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Officer filing POST request returned no response for transaction 2222");
    });

    it("Should throw an error when officer filing api returns a status greater than 400", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 404
      });
      const officerFiling: OfficerFiling = {
        referenceAppointmentId: APPOINTMENT_ID
      };

      await expect(postOfficerFiling(session, TRANSACTION_ID, officerFiling)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Http status code 404 - Failed to post officer filing for transaction 2222");
    });

    it("Should throw an error when officer filing api returns no resource", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200
      });
      const officerFiling: OfficerFiling = {
        referenceAppointmentId: APPOINTMENT_ID
      };

      await expect(postOfficerFiling(session, TRANSACTION_ID, officerFiling)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Officer filing API POST request returned no resource for transaction 2222");
    });

  });

  describe("patchOfficerFiling tests", () => {

    it("Should throw an error when no officer filing api response", async () => {
      mockPatchOfficerFiling.mockResolvedValueOnce(undefined);
      const officerFiling: OfficerFiling = {
        referenceAppointmentId: APPOINTMENT_ID
      };

      await expect(patchOfficerFiling(session, TRANSACTION_ID, APPOINTMENT_ID, officerFiling)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Officer filing PATCH request returned no response for transaction 2222");
    });

    it("Should throw an error when officer filing api returns a status greater than 400", async () => {
      mockPatchOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 404
      });
      const officerFiling: OfficerFiling = {
        referenceAppointmentId: APPOINTMENT_ID
      };

      await expect(patchOfficerFiling(session, TRANSACTION_ID, APPOINTMENT_ID, officerFiling)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Http status code 404 - Failed to patch officer filing for transaction 2222");
    });

    it("Should throw an error when officer filing api returns no resource", async () => {
      mockPatchOfficerFiling.mockResolvedValueOnce({
        httpStatusCode: 200
      });
      const officerFiling: OfficerFiling = {
        referenceAppointmentId: APPOINTMENT_ID
      };

      await expect(patchOfficerFiling(session, TRANSACTION_ID, APPOINTMENT_ID, officerFiling)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Officer filing API PATCH request returned no resource for transaction 2222");
    });
  });
});
