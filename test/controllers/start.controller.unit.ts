import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "Before you start";
const PAGE_HEADING_WELSH = "Penodi, diweddaru a dileu cyfarwyddwr cwmni";

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

        expect(response.text).toContain(PAGE_HEADING_WELSH);
  });

});