jest.mock("../../src/services/transaction.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { COMPANY_NUMBER, CREATE_TRANSACTION_PATH, OFFICER_FILING } from "../../src/types/page.urls";
import { postTransaction } from "../../src/services/transaction.service";

const mockPostTransaction = postTransaction as jest.Mock;

describe("Create transaction controller tests", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should redirect", async () => {
    mockPostTransaction.mockReturnValueOnce({id: "12345678"});
    const response = await request(app)
      .get(CREATE_TRANSACTION_PATH);

    expect(mockPostTransaction).toHaveBeenCalled();
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/appoint-update-remove-company-officer/company/:companyNumber/transaction/12345678/current-directors");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should redirect with lang on forward path", async () => {
    mockPostTransaction.mockReturnValueOnce({id: "12345678"});
    const response = await request(app)
      .get(CREATE_TRANSACTION_PATH + "?lang=cy");

    expect(mockPostTransaction).toHaveBeenCalled();
    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/appoint-update-remove-company-officer/company/:companyNumber/transaction/12345678/current-directors?lang=cy");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should 404 not found on post", async () => {
    const response = await request(app)
      .post(CREATE_TRANSACTION_PATH);

    expect(response.status).toEqual(404);
  });
});

