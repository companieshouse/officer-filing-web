import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "Before you start";
const EXPECTED_WELSH = "Cyn i chi ddechrau";

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return start page", async () => {
    const response = await request(app)
      .get("/appoint-update-remove-company-officer");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
    expect(response.text).toContain('/appoint-update-remove-company-officer/company-number?lang=en');
  });

  it("should return start page when url has trailing slash", async () => {
    const response = await request(app)
      .get("/appoint-update-remove-company-officer/");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
  });

 it("Should render the page in welsh", async () => {
    const response = await request(app)
      .get("/appoint-update-remove-company-officer/" + "?lang=cy");

    expect(response.text).toContain(EXPECTED_WELSH);
    expect(response.text).toContain('/appoint-update-remove-company-officer/company-number?lang=cy');
  });

});