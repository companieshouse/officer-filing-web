import { mockValidationStatusResponse, mockValidationStatusResponseList, mockValidationStatusResponseList2, mockValidationStatusResponseList3, mockValidationStatusResponseList4 } from "../mocks/validation.status.response.mock";
import { retrieveErrorMessageToDisplay, retrieveStopScreen } from "../../src/services/remove.directors.error.keys.service";
import { STOP_TYPE } from "../../src/utils/constants";

describe("Test remove director error keys service", () => {

  describe("retrieveErrorMessageToDisplay tests", () => {

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
  
    it("Should return empty string if message is not found", async () => {
      const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponse);
      expect(newMessage).toEqual("");
    });
  });

  describe("Test remove director error keys service", () => {
    it("Should return first stop query that matches priority order", async () => {
      const stopQuery = retrieveStopScreen(mockValidationStatusResponseList);
      expect(stopQuery).toEqual(STOP_TYPE.DISSOLVED);
    });

    it("Should return empty string if stop query is not found", async () => {
      const stopQuery = retrieveStopScreen(mockValidationStatusResponseList2);
      expect(stopQuery).toEqual("");
    });
  });
});
