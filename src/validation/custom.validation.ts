// Custom validation utils - For now checking is not empty

import { DateTime } from "luxon";
import { ErrorMessages } from "./error.messages";


export const checkDateIsNotCompletelyEmpty = (day: string = "", month: string = "", year: string = "") => {
  if ( !day.trim() && !month.trim() && !year.trim() ) {
    return false;
  }
  return true;
};

export const checkDateValueIsValid = (invalidDateErrMsg: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  if (isNaN(day) || isNaN(month) || isNaN(year) || !DateTime.utc(year, month, day).isValid) {
    throw new Error(invalidDateErrMsg);
  }

  return true;
};

export const checkDateFieldDay = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (!checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
    throw new Error(ErrorMessages.ENTER_DATE);
  }
  else if (dayStr === "") {
    throw new Error(ErrorMessages.DAY);
  }
  if (checkAllDateFieldsArePresent(dayStr, monthStr, yearStr)) {
    checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
  }
  return true;
};

export const checkDateFieldMonth = (monthMissingMessage: string, dayStr: string = "", monthStr: string = "") => {
    if (monthStr === "" && dayStr !== "") {
      throw new Error(monthMissingMessage);
    }
  return true;
};

export const checkDateFieldYear = (yearMissingMessage: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (yearStr === "" && dayStr !== "" && monthStr !== "") {
      throw new Error(yearMissingMessage);
    }
  return true;
};

const checkAllDateFieldsArePresent = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (dayStr === "" || monthStr === "" || yearStr === "") {
    return false;
  }
  return true;
};




