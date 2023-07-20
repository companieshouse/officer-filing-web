jest.mock("ioredis");
jest.mock("../../src/utils/feature.flag");

import request from "supertest";
import app from "../../src/app";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;

describe("service availability middleware tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 500 error page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(false);
    const response = await request(app).get("/appoint-update-remove-company-officer");

    expect(response.text).toContain("Sorry, there is a problem with this service");
  });

  it("should not return 500 error page", async () => {
    mockIsActiveFeature.mockReturnValueOnce(true);
    const response = await request(app).get("/appoint-update-remove-company-officer");

    expect(response.text).not.toContain("Sorry, there is a problem with this service");
  });
});
