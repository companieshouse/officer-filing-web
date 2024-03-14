jest.mock("../../src/services/transaction.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { CREATE_TRANSACTION_PATH } from "../../src/types/page.urls";
import { postTransaction } from "../../src/services/transaction.service";

const mockPostTransaction = postTransaction as jest.Mock;
const MOCK_COMPANY_NUMBER = "01777777";
const MOCK_TRANSACTION_NUMBER = "12345678";
const CREATE_TRANSACTION_URL = CREATE_TRANSACTION_PATH.replace(":companyNumber", MOCK_COMPANY_NUMBER);
const EXPECTED_HEADER_LOCATION = "/appoint-update-remove-company-officer/company/" + MOCK_COMPANY_NUMBER + "/transaction/" + MOCK_TRANSACTION_NUMBER + "/current-directors";

describe("Create transaction controller tests", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect", async () => {
    mockPostTransaction.mockReturnValueOnce({id: MOCK_TRANSACTION_NUMBER});
    const response = await request(app)
      .get(CREATE_TRANSACTION_URL);

    expect(mockPostTransaction).toHaveBeenCalled();
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(EXPECTED_HEADER_LOCATION); 
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should redirect with lang on forward path", async () => {
    mockPostTransaction.mockReturnValueOnce({id: MOCK_TRANSACTION_NUMBER});
    const response = await request(app)
      .get(CREATE_TRANSACTION_URL + "?lang=cy");

    expect(mockPostTransaction).toHaveBeenCalled();
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual(EXPECTED_HEADER_LOCATION + "?lang=cy");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should 404 not found on post", async () => {
    const response = await request(app)
      .post(CREATE_TRANSACTION_PATH);

    expect(response.status).toEqual(404);
  });
});
