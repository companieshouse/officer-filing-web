import {
  mockValidValidationStatusResponse,
  mockValidationStatusResponse,
  mockValidationStatusResponseList,
  mockValidationStatusResponseList2,
  mockValidationStatusResponseList3,
  mockValidationStatusResponseList4,
  mockValidationStatusResponsePreOct2009,
  mockValidationStatusResponseUndefined
} from "../mocks/validation.status.response.mock";
import { retrieveErrorMessageToKey, retrieveStopPageTypeToDisplay } from "../../src/services/remove.directors.error.keys.service";
import {RemovalDateValidation} from "../../src/validation/remove.date.validation.config";

describe("Test remove director date service", () => {

  describe("Test retrieve error message to display", () => {

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

    it("Should return empty string if response contains no errors", async () => {
      const stopType = retrieveErrorMessageToKey(mockValidValidationStatusResponse, RemovalDateValidation);
      expect(stopType).toEqual(undefined);
    });
    
    it("Should return empty string if web error message is not found", async () => {
      const newMessage = retrieveErrorMessageToKey(mockValidationStatusResponse, RemovalDateValidation);
      expect(newMessage).toEqual(undefined);
    });

    it("Should return empty string if web error message is not found", async () => {
      const newMessage = retrieveErrorMessageToKey(mockValidationStatusResponseUndefined, RemovalDateValidation);
      expect(newMessage).toEqual(undefined);
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

    it("Should return empty string if stop type message is not defined", async () => {
      const stopType = retrieveStopPageTypeToDisplay(mockValidationStatusResponseUndefined);
      expect(stopType).toEqual("");
    });

  });

});
