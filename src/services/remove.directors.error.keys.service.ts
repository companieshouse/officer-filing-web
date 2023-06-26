import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { convertAPIMessageToKey, lookupWebValidationMessage } from "../utils/api.enumerations";
import { STOP_TYPE } from "../utils/constants";

export const retrieveErrorMessageToDisplay = (validationStatusResponse: ValidationStatusResponse): string => {

    var listOfValidationKeys = new Array();

    if (!validationStatusResponse.errors) {
        return "";
    }

    validationStatusResponse.errors.forEach(element => {
      listOfValidationKeys.push(convertAPIMessageToKey(element.error));
    });

    if (listOfValidationKeys.includes("removal-date-invalid")) {
        return lookupWebValidationMessage("removal-date-invalid");
    }
    else if (listOfValidationKeys.includes("removal-date-in-past")) {
        return lookupWebValidationMessage("removal-date-in-past");
    }
    else if (listOfValidationKeys.includes("removal-date-after-incorporation-date")) {
        return lookupWebValidationMessage("removal-date-after-incorporation-date");
    }
    else if (listOfValidationKeys.includes("removal-date-after-appointment-date")) {
        return lookupWebValidationMessage("removal-date-after-appointment-date");
    }

    return "";
  };

  /**
   * Work out whether any of the error messages returned within the validation status repsonse require a stop page be displayed to the user.
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

    if (listOfValidationKeys.includes("company-dissolved")) {
        return STOP_TYPE.DISSOLVED;
    }
    else if (listOfValidationKeys.includes("removal-date-after-2009")) {
        return STOP_TYPE.PRE_OCTOBER_2009;
    }
    else if (listOfValidationKeys.includes("etag-invalid")) {
        return STOP_TYPE.ETAG;
    }

    return "";
  };
