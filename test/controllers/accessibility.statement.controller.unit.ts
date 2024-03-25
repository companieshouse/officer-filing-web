import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { ACCESSIBILITY_STATEMENT_PATH } from "../../src/types/page.urls";

const PAGE_HEADING_EN = "Accessibility statement for Appoint, update and remove a company director service";
const PAGE_HEADING_CY = "Datganiad hygyrchedd ar gyfer y gwasanaeth Penodi, diweddaru a dileu cyfarwyddwr cwmni";

describe("accessibility statement controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([["?lang=en", PAGE_HEADING_EN], ["?lang=cy", PAGE_HEADING_CY]])("should return accessibility statement page in the correct language", async (lang, heading) => {
    const response = await request(app)
      .get(ACCESSIBILITY_STATEMENT_PATH+lang);

    expect(response.text).toContain(heading);
    expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
    expect(middlewareMocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
  });
});
