import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { ACCESSIBILITY_STATEMENT_PATH } from "../../src/types/page.urls";

const PAGE_HEADING = "Accessibility statement for the Remove a company director service";

describe("accessibility statement controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return accessibility statement page", async () => {
    const response = await request(app)
      .get(ACCESSIBILITY_STATEMENT_PATH);

    expect(response.text).toContain(PAGE_HEADING);
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
    expect(middlewareMocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
  });
});
