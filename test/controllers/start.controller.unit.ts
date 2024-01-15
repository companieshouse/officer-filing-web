import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "Remove a company director";

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return start page", async () => {
    const response = await request(app)
      .get("/appoint-update-remove-company-officer");

    expect(response.text).toContain(EXPECTED_TEXT);
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
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

        expect(response.text).toContain("to be translated");

});
