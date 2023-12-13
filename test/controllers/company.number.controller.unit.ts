import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { COMPANY_NUMBER, OFFICER_FILING } from "../../src/types/page.urls";

describe("Confirm company controller tests", () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const COMPANY_NUMBER_PATH = OFFICER_FILING + "/" + COMPANY_NUMBER;

  it("should redirect to company lookup page", async () => {
    const response = await request(app)
      .get(COMPANY_NUMBER_PATH);

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/company-lookup/search?forward=/appoint-update-remove-company-officer/confirm-company?companyNumber=%7BcompanyNumber%7D");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should redirect to company lookup page with lang on forward path", async () => {
    const response = await request(app)
      .get(COMPANY_NUMBER_PATH + "?lang=cy");

    expect(response.status).toEqual(302);
    expect(response.header.location).toEqual("/company-lookup/search?forward=%2Fappoint-update-remove-company-officer%2Fconfirm-company%3FcompanyNumber%3D%7BcompanyNumber%7D%26lang%3Dcy");
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should 404 not found on post", async () => {
    const response = await request(app)
      .post(COMPANY_NUMBER_PATH);

    expect(response.status).toEqual(404);
  });
});

