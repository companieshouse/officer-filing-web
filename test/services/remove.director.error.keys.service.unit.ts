import { mockValidationStatusResponse, mockValidationStatusResponseEtag, mockValidationStatusResponseList, mockValidationStatusResponseList2, mockValidationStatusResponseList3, mockValidationStatusResponseList4, mockValidationStatusResponsePreOct2009 } from "../mocks/validation.status.response.mock";
import { retrieveErrorMessageToKey, retrieveStopPageTypeToDisplay } from "../../src/services/remove.directors.error.keys.service";
import { STOP_TYPE } from "../../src/utils/constants";
import {RemovalDateValidation} from "../../src/validation/remove.date.validation.config";

describe("Test remove director error keys service", () => {

  describe("retrieve error message tests", () => {

    it("Should return first web error message that matches priority order", async () => {
      const newMessage = retrieveErrorMessageToKey(mockValidationStatusResponseList, RemovalDateValidation);
      expect(newMessage).toEqual(expect.objectContaining({"messageKey": "removal-date-invalid"}));
    });
  
    it("Should return next web error message that matches priority order", async () => {
      const newMessage = retrieveErrorMessageToKey(mockValidationStatusResponseList2, RemovalDateValidation);
      expect(newMessage).toEqual(expect.objectContaining({"messageKey": "removal-date-in-past"}));
    });
  
    it("Should return next web error message that matches priority order", async () => {
      const newMessage = retrieveErrorMessageToKey(mockValidationStatusResponseList3, RemovalDateValidation);
      expect(newMessage).toEqual(expect.objectContaining({"messageKey": "removal-date-after-incorporation-date"}));
    });
  
    it("Should return next web error message that matches priority order", async () => {
      const newMessage = retrieveErrorMessageToKey(mockValidationStatusResponseList4, RemovalDateValidation);
      expect(newMessage).toEqual(expect.objectContaining({"messageKey": "removal-date-after-appointment-date"}));
    });
  
    it("Should return empty string if message is not found", async () => {
      const newMessage = retrieveErrorMessageToKey(mockValidationStatusResponse, RemovalDateValidation);
      expect(newMessage).toEqual(undefined);
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
