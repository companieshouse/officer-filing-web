jest.mock("../../src/utils/feature.flag")

import mocks from "../mocks/all.middleware.mock";
import app from "../../src/app";
import request from "supertest";
import { isActiveFeature } from "../../src/utils/feature.flag";
import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS
} from "../../src/types/page.urls";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

const PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS;
const NEXT_PAGE_URL = DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH;
const PAGE_HEADING = "Choose an address";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

describe('Director correspondence address choose address controller test', () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("get tests",  () => {
    it("Should navigate to director correspondence choose address page", async () => {
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(PAGE_HEADING);
    });
    it("Should navigate to error page when feature flag is off", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });
  });
  describe("post tests",  () => {
    it("Should navigate to director confirm correspondence address page", async () => {
      const response = await request(app).post(PAGE_URL);

      expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
    });
  });

});