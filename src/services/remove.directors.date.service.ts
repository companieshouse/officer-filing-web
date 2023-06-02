import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { convertAPIMessageToKey, lookupWebValidationMessage } from "../utils/api.enumerations";


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
  