import { mockValidationStatusResponse, mockValidationStatusResponseList, mockValidationStatusResponseList2, mockValidationStatusResponseList3, mockValidationStatusResponseList4 } from "../mocks/validation.status.response.mock";
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

  it("Should return next web error message that matches priority order", async () => {
    const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponseList3);
    expect(newMessage).toEqual("Enter a date that is on or after the company's incorporation date");
  });

  it("Should return next web error message that matches priority order", async () => {
    const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponseList4);
    expect(newMessage).toEqual("Enter a date that is on or after the date the director was appointed");
  });

  it("should return empty string if message is not found", async () => {
    const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponse);
    expect(newMessage).toEqual("");
  });
});
