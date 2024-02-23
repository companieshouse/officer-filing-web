import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { convertAPIMessageToKey, lookupWebValidationMessage } from "../utils/api.enumerations";
import { STOP_TYPE } from "../utils/constants";
import { ErrorMessageKey, RemovalDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { DateValidationType, ValidationError } from "../model/validation.model";

export const retrieveErrorMessageToKey = (validationStatusResponse: ValidationStatusResponse, dateValidationType: DateValidationType): ValidationError | undefined => {

    var listOfValidationKeys = new Array();

    if (!validationStatusResponse.errors) {
        return undefined;
    }

    validationStatusResponse.errors.forEach(element => {
      listOfValidationKeys.push(convertAPIMessageToKey(element.error));
    });

    if (listOfValidationKeys.includes(RemovalDateErrorMessageKey.INVALID_DATE)) {
      return dateValidationType.InvalidValue.DayMonthYear;
    }
    else if (listOfValidationKeys.includes(RemovalDateErrorMessageKey.IN_PAST)) {
      return dateValidationType.RuleBased?.FutureDate;
    }
    else if (listOfValidationKeys.includes(RemovalDateErrorMessageKey.AFTER_INCORPORATION_DATE)) {
      return dateValidationType.RuleBased?.IncorporationDate;
    }
    else if (listOfValidationKeys.includes(RemovalDateErrorMessageKey.AFTER_APPOINTMENT_DATE)) {
      return dateValidationType.RuleBased?.DateOfChangeBeforeAppointment;
    }

    return undefined;
  };

  /**
   * Work out whether any of the error messages returned within the validation status response require a stop page be displayed to the user.
   * If so, map that error message to the appropriate stop-type and return it.
   * @param validationStatusResponse Contains the errors to be analysed
   * @returns Either the name of the stop type or an empty string
   */
  export const retrieveStopPageTypeToDisplay = (validationStatusResponse: ValidationStatusResponse): string => {
    var listOfValidationKeys = new Array();
    
    if (!validationStatusResponse.errors) {
        return "";
    }

    validationStatusResponse.errors?.forEach(element => {
        listOfValidationKeys.push(convertAPIMessageToKey(element.error));
    });

    if (listOfValidationKeys.includes(ErrorMessageKey.COMPANY_DISSOLVED)) {
        return STOP_TYPE.DISSOLVED;
    }
    else if (listOfValidationKeys.includes(RemovalDateErrorMessageKey.AFTER_2009)) {
        return STOP_TYPE.PRE_OCTOBER_2009;
    }
    else if (listOfValidationKeys.includes(ErrorMessageKey.ETAG_INVALID)) {
        return STOP_TYPE.ETAG;
    }

    return "";
  };
