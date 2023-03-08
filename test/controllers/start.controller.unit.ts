import middlewareMocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

const EXPECTED_TEXT = "Remove a company director";

describe("start controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return start page", async () => {
    const response = "TODO ..."

    expect(response.text).toContain("TODO");
  });


});
