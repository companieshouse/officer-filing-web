jest.mock("../../src/utils/logger");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { logger } from "../../src/utils/logger";
import { SERVICE_ERROR_PATH, CONFIRM_COMPANY_PATH, PAGE_NOT_FOUND_PATH } from "../../src/types/page.urls";
import { NextFunction } from "express";

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;

const EXPECTED_TEXT = "Page not found";
const INCORRECT_URL = "/appoint-update-remove-company-officer/company-numberr";

describe("Error controller test", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Should return page not found screen if page url is not recognised", async () => {
    const response = await request(app)
      .get(INCORRECT_URL);
    expect(response.text).toContain(EXPECTED_TEXT);
    expect(response.status).toEqual(404);
    expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
  });

  it("should render the page-not-found page", async () => {

    const response = await request(app)
      .get(PAGE_NOT_FOUND_PATH);

    expect(response.text).toContain("Page not found");
  });

  it("should render the page-not-found page in welsh", async () => {

    const response = await request(app)
      .get(PAGE_NOT_FOUND_PATH + "?lang=cy");

    expect(response.text).toContain("Ni ddarganfuwyd y dudalen");
    expect(response.text).toContain("gwiriwch ei fod yn gywir");
  });

  it("should render the error page", async () => {

    const response = await request(app)
      .get(SERVICE_ERROR_PATH);

    expect(response.text).toContain("Sorry, there is a problem with this service");
  });

  it("should render the error page in welsh", async () => {

    const response = await request(app)
      .get(SERVICE_ERROR_PATH + "?lang=cy");

    expect(response.text).toContain("Mae&#39;n ddrwg gennym, mae problem gyda&#39;r gwasanaeth");
  });

  it("Should render the error page on error", async () => {

    const message = "Can't connect";
    mocks.setShouldThrowError(true, message);

    const response = await request(app).get(CONFIRM_COMPANY_PATH);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, there is a problem with this service");
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(message);

  });
});
