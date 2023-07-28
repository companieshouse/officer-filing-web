import { mockValidValidationStatusResponse, mockValidationStatusResponse, mockValidationStatusResponseList, mockValidationStatusResponseList2, mockValidationStatusResponseList3, mockValidationStatusResponseList4, mockValidationStatusResponsePreOct2009 } from "../mocks/validation.status.response.mock";
import { retrieveErrorMessageToDisplay, retrieveStopPageTypeToDisplay } from "../../src/services/remove.directors.error.keys.service";

describe("Test remove director date service", () => {

  describe("Test retrieve error message to display", () => {

    it("Should return first web error message that matches priority order", async () => {
      const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponseList);
      expect(newMessage).toEqual("Date the director was removed must be a real date");
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

    it("Should return empty string if response contains no errors", async () => {
      const stopType = retrieveErrorMessageToDisplay(mockValidValidationStatusResponse);
      expect(stopType).toEqual("");
    });
    
    it("Should return empty string if web erreor message is not found", async () => {
      const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponse);
      expect(newMessage).toEqual("");
    });
    
  });

  describe("Test retrieve stop page type to display", () => {

    it("Should return first stop type when error message is caught", async () => {
      const stopType = retrieveStopPageTypeToDisplay(mockValidationStatusResponsePreOct2009);
      expect(stopType).toEqual("pre-october-2009");
    });

    it("Should return empty string if response contains no errors", async () => {
      const stopType = retrieveStopPageTypeToDisplay(mockValidValidationStatusResponse);
      expect(stopType).toEqual("");
    });

    it("Should return empty string if stop type message is not found", async () => {
      const stopType = retrieveStopPageTypeToDisplay(mockValidationStatusResponse);
      expect(stopType).toEqual("");
    });

  });

});
