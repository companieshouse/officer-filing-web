jest.mock("../../src/utils/logger");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { NextFunction } from "express";
import { CONFIRM_COMPANY_PATH } from "../../src/types/page.urls";
import { logger } from "../../src/utils/logger";

const mockLoggerErrorRequest = logger.errorRequest as jest.Mock;

const EXPECTED_TEXT = "Page not found";
const INCORRECT_URL = "/officer-filing-web/company-numberr";

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

  it("Should render the error page", async () => {
    const message = "Can't connect";
    mocks.mockSessionMiddleware.mockImplementationOnce((req: Request, res: Response, next: NextFunction) => {
      return next(new Error(message));
    });
    const response = await request(app)
      .get(CONFIRM_COMPANY_PATH);

    expect(response.status).toEqual(500);
    expect(response.text).toContain("Sorry, there is a problem with the service");
    expect(mockLoggerErrorRequest.mock.calls[0][1]).toContain(message);
  });
});
