jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/api.service");
jest.mock("../../src/utils/logger");

import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "../../src/services/api.service";
import { closeTransaction, getTransaction, postTransaction, putTransaction } from "../../src/services/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createAndLogError } from "../../src/utils/logger";
import Resource, { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { REFERENCE } from "../../src/utils/constants";

const mockCreatePublicOAuthApiClient = createPublicOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();
const mockPutTransaction = jest.fn();
const mockGetTransaction = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreatePublicOAuthApiClient.mockReturnValue({
  transaction: {
    getTransaction: mockGetTransaction,
    postTransaction: mockPostTransaction,
    putTransaction: mockPutTransaction
  }
});

const ERROR: Error = new Error("oops");
mockCreateAndLogError.mockReturnValue(ERROR);

let session: any;
const TRANSACTION_ID = "2222";
const COMPANY_NUMBER = "12345678";
const CS_SUBMISSION_ID = "764347373";
const EXPECTED_REF = REFERENCE + "_" + CS_SUBMISSION_ID;

describe("transaction service tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  describe("postTransaction tests", () => {
    it("Should successfully post a transaction", async() => {
      mockPostTransaction.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: {
          reference: "ref",
          companyNumber: COMPANY_NUMBER,
          description: "desc"
        }
      });
      const transaction: Transaction = await postTransaction(session, COMPANY_NUMBER, "desc", "ref");

      expect(transaction.reference).toEqual("ref");
      expect(transaction.companyNumber).toEqual(COMPANY_NUMBER);
      expect(transaction.description).toEqual("desc");
    });

    it("Should throw an error when no transaction api response", async () => {
      mockPostTransaction.mockResolvedValueOnce(undefined);

      await expect(postTransaction(session, COMPANY_NUMBER, "desc", "ref")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Transaction API POST request returned no response for company number 12345678");
    });

    it("Should throw an error when transaction api returns a status greater than 400", async () => {
      mockPostTransaction.mockResolvedValueOnce({
        httpStatusCode: 404
      });

      await expect(postTransaction(session, COMPANY_NUMBER, "desc", "ref")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Http status code 404 - Failed to post transaction for company number 12345678");
    });

    it("Should throw an error when transaction api returns no resource", async () => {
      mockPostTransaction.mockResolvedValueOnce({
        httpStatusCode: 200
      });

      await expect(postTransaction(session, COMPANY_NUMBER, "desc", "ref")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith("Transaction API POST request returned no resource for company number 12345678");
    });
  });


  describe("putTransaction tests", () => {
    it("Should successfully PUT a transaction", async () => {
      mockPutTransaction.mockResolvedValueOnce({
        headers: {
          "X-Payment-Required": "http://payment"
        },
        httpStatusCode: 200,
        resource: {
          reference: EXPECTED_REF,
          companyNumber: COMPANY_NUMBER,
          description: "desc",
          status: "closed"
        }
      } as ApiResponse<Transaction>);
      const transaction: ApiResponse<Transaction> = await putTransaction(session, COMPANY_NUMBER, CS_SUBMISSION_ID, TRANSACTION_ID, "desc", "closed");

      expect(transaction.resource?.reference).toEqual(EXPECTED_REF);
      expect(transaction.resource?.companyNumber).toEqual(COMPANY_NUMBER);
      expect(transaction.resource?.description).toEqual("desc");
      expect(transaction.resource?.status).toEqual("closed");

      expect(mockPutTransaction.mock.calls[0][0].status).toBe("closed");
      expect(mockPutTransaction.mock.calls[0][0].id).toBe(TRANSACTION_ID);
      expect(mockPutTransaction.mock.calls[0][0].reference).toBe(EXPECTED_REF);
    });

    it("Should throw an error when no transaction api response", async () => {
      mockPutTransaction.mockResolvedValueOnce(undefined);

      await expect(putTransaction(session, COMPANY_NUMBER, CS_SUBMISSION_ID, TRANSACTION_ID, "desc", "closed")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Transaction API PUT request returned no response for transaction id ${TRANSACTION_ID}, company number ${COMPANY_NUMBER}`);
    });

    it("Should throw an error when transaction api returns a status greater than 400", async () => {
      mockPutTransaction.mockResolvedValueOnce({
        httpStatusCode: 404
      });

      await expect(putTransaction(session, COMPANY_NUMBER, CS_SUBMISSION_ID, TRANSACTION_ID, "desc", "closed")).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Http status code 404 - Failed to put transaction for transaction id ${TRANSACTION_ID}, company number ${COMPANY_NUMBER}`);
    });
  });

  describe("closeTransaction tests", () => {
    it("Should extract payment url from headers", async () => {
      const paymentUrl = "http://payment";
      mockPutTransaction.mockResolvedValueOnce({
        headers: {
          "x-payment-required": paymentUrl
        },
        httpStatusCode: 200,
        resource: {
          reference: EXPECTED_REF,
          companyNumber: COMPANY_NUMBER,
          description: "desc",
          status: "closed"
        }
      } as ApiResponse<Transaction>);

      const url = await closeTransaction(session, COMPANY_NUMBER, CS_SUBMISSION_ID, TRANSACTION_ID);

      expect(url).toBe(paymentUrl);
    });

    it("Should return undefined if payment header not present", async () => {
      mockPutTransaction.mockResolvedValueOnce({
        headers: {  },
        httpStatusCode: 200,
        resource: {
          reference: EXPECTED_REF,
          companyNumber: COMPANY_NUMBER,
          description: "desc",
          status: "closed"
        }
      } as ApiResponse<Transaction>);

      const url = await closeTransaction(session, COMPANY_NUMBER, CS_SUBMISSION_ID, TRANSACTION_ID);

      expect(url).toBeUndefined();
    });

    it("Should return undefined if no headers present", async () => {
      mockPutTransaction.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: {
          reference: EXPECTED_REF,
          companyNumber: COMPANY_NUMBER,
          description: "desc",
          status: "closed"
        }
      } as ApiResponse<Transaction>);

      const url = await closeTransaction(session, COMPANY_NUMBER, CS_SUBMISSION_ID, TRANSACTION_ID);

      expect(url).toBeUndefined();
    });
  });

  describe("getTransaction tests", () => {
    it("Should return a transaction", async () => {
      const dummyTransaction: Transaction = {
        reference: EXPECTED_REF,
        companyNumber: COMPANY_NUMBER,
        description: "desc",
        status: "closed"
      };

      mockGetTransaction.mockResolvedValueOnce({
        httpStatusCode: 200,
        resource: dummyTransaction
      } as Resource<Transaction>);

      const transaction: Transaction = await getTransaction(session, TRANSACTION_ID);

      expect(transaction).toStrictEqual(dummyTransaction);
    });

    it("Should throw an error when no transaction api response", async () => {
      mockGetTransaction.mockResolvedValueOnce(undefined);

      await expect(getTransaction(session, TRANSACTION_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Transaction API GET request returned no response for transaction id ${TRANSACTION_ID}`);
    });

    it("Should throw an error when transaction api returns a response with no status", async () => {
      mockGetTransaction.mockResolvedValueOnce({});

      await expect(getTransaction(session, TRANSACTION_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Http status code undefined - Failed to get transaction for transaction id ${TRANSACTION_ID}`);
    });

    it("Should throw an error when transaction api returns a status greater than 400", async () => {
      mockGetTransaction.mockResolvedValueOnce({
        httpStatusCode: 404
      });

      await expect(getTransaction(session, TRANSACTION_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Http status code 404 - Failed to get transaction for transaction id ${TRANSACTION_ID}`);
    });

    it("Should throw an error when transaction api returns no resource", async () => {
      mockGetTransaction.mockResolvedValueOnce({
        httpStatusCode: 200
      });

      await expect(getTransaction(session, TRANSACTION_ID)).rejects.toThrow(ERROR);
      expect(mockCreateAndLogError).toBeCalledWith(`Transaction API GET request returned no resource for transaction id ${TRANSACTION_ID}`);
    });
  });
});
