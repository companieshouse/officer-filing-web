// Custom validation utils - For now checking is not empty

import { DateTime } from "luxon";
import { ErrorMessages } from "./error.messages";


export const checkDateIsNotCompletelyEmpty = (day: string = "", month: string = "", year: string = "") => {
  if ( !day.trim() && !month.trim() && !year.trim() ) {
    return false;
  }
  return true;
};

export const checkDateValueIsValid = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  if (checkDayValueIsValid(dayStr) && checkMonthValueIsValid(monthStr) && checkYearValueIsValid(yearStr)) {
    if( !DateTime.utc(year, month, day).isValid){
      throw new Error(ErrorMessages.INVALID_DATE);
    }
  }
  return true;
};

export const checkDayValueIsValid = (dayStr: string = "") => {
  const day = parseInt(dayStr);
  if (isNaN(day)) {
    return false;
  }
  return true;
}

export const checkMonthValueIsValid = (monthStr: string = "") => {
  const month = parseInt(monthStr);
  if (isNaN(month)) {
    return false;
  }
  return true;
}

export const checkYearValueIsValid = (yearStr: string = "") => {
  const year = parseInt(yearStr);
  if (isNaN(year)) {
    return false;
  }
  return true;
}

export const checkDateFieldDay = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (!checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
    throw new Error(ErrorMessages.ENTER_DATE);
  }
  else if (dayStr === "") {
    throw new Error(ErrorMessages.DAY);
  }
  else if(monthStr !== "" && yearStr !== "" && !checkDayValueIsValid(dayStr)){
    throw new Error(ErrorMessages.DAY_INVALID_CHARACTER);
  }
  else if (checkAllDateFieldsArePresent(dayStr, monthStr, yearStr)) {
    checkDateValueIsValid(dayStr, monthStr, yearStr);
  }
  return true;
};

export const checkDateFieldMonth = (monthMissingMessage: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (monthStr === "" && dayStr !== "") {
    throw new Error(monthMissingMessage);
  }
  else if(dayStr !== "" && yearStr !== "" && checkDayValueIsValid(dayStr) && !checkMonthValueIsValid(monthStr)){
    throw new Error(ErrorMessages.MONTH_INVALID_CHARACTER);
  }
  return true;
};

export const checkDateFieldYear = (yearMissingMessage: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (yearStr === "" && dayStr !== "" && monthStr !== "") {
      throw new Error(yearMissingMessage);
    }
  else if(dayStr !== "" && monthStr !== "" && checkDayValueIsValid(dayStr) && checkMonthValueIsValid(monthStr) && !checkYearValueIsValid(yearStr)){
    throw new Error(ErrorMessages.YEAR_INVALID_CHARACTER);
  }
  return true;
};

const checkAllDateFieldsArePresent = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (dayStr === "" || monthStr === "" || yearStr === "") {
    return false;
  }
  return true;
};




