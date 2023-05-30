import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { getSessionRequest } from "../mocks/session.mock";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ValidationStatusResponse, OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { mockValidationStatusResponse, mockValidationStatusResponseList, mockValidationStatusResponseList2 } from "../mocks/validation.status.response.mock";
import { retrieveErrorMessageToDisplay } from "../../src/services/remove.directors.date.service";

describe("Test remove director date service", () => {

  it("Should return first web error message that matches priority order", async () => {
    const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponseList);
    expect(newMessage).toEqual("Date director was removed must be a real date");
  });

  it("Should return next web error message that matches priority order", async () => {
    const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponseList2);
    expect(newMessage).toEqual("Enter a date that is in the past");
  });

  it("should return empty string if message is not found", async () => {
    const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponse);
    expect(newMessage).toEqual("");
  });
});
