import { mockValidationStatusResponse, mockValidationStatusResponseEtag, mockValidationStatusResponseList, mockValidationStatusResponseList2, mockValidationStatusResponseList3, mockValidationStatusResponseList4, mockValidationStatusResponsePreOct2009 } from "../mocks/validation.status.response.mock";
import { retrieveErrorMessageToDisplay, retrieveStopPageTypeToDisplay } from "../../src/services/remove.directors.error.keys.service";
import { STOP_TYPE } from "../../src/utils/constants";

describe("Test remove director error keys service", () => {

  describe("retrieve error message tests", () => {

    it("Should return first web error message that matches priority order", async () => {
      const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponseList);
      expect(newMessage).toEqual("Date the director was removed must be a real date");
    });
  
    it("Should return next web error message that matches priority order", async () => {
      const newMessage = retrieveErrorMessageToDisplay(mockValidationStatusResponseList2);
      expect(newMessage).toEqual("Enter a date that is today or in the past");
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

  describe("retrieve stop type tests", () => {
    it("Should return first stop query that matches priority order", async () => {
      const stopQuery = retrieveStopPageTypeToDisplay(mockValidationStatusResponseList);
      expect(stopQuery).toEqual(STOP_TYPE.DISSOLVED);
    });

    it("Should return empty string if stop query is not found", async () => {
      const stopQuery = retrieveStopPageTypeToDisplay(mockValidationStatusResponseList2);
      expect(stopQuery).toEqual("");
    });

    it("Should return pre october 2009 stop type", async () => {
      const stopQuery = retrieveStopPageTypeToDisplay(mockValidationStatusResponsePreOct2009);
      expect(stopQuery).toEqual(STOP_TYPE.PRE_OCTOBER_2009);
    });

    it("Should return etag stop type", async () => {
      const stopQuery = retrieveStopPageTypeToDisplay(mockValidationStatusResponseEtag);
      expect(stopQuery).toEqual(STOP_TYPE.ETAG);
    });
  });
});
