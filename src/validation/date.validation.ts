import { DateTime } from "luxon";
import { ErrorMessages } from "./error.messages";


export const checkDateIsNotCompletelyEmpty = (day: string, month: string, year: string) => {
  if ( !day.trim() && !month.trim() && !year.trim() ) {
    return false;
  }
  return true;
};

export const checkDateValueIsValid = (dayStr: string, monthStr: string, yearStr: string) => {
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  if (checkIsNumber(dayStr) && checkIsNumber(monthStr) && checkIsNumber(yearStr)) {
    if( !DateTime.utc(year, month, day).isValid){
      throw new Error(ErrorMessages.INVALID_DATE);
    }
  }
  return true;
};

export const checkIsNumber = (dayStr: string) => {
  const day = parseInt(dayStr);
  if (isNaN(day)) {
    return false;
  }
  return true;
}

export const checkDateFieldDay = (dayStr: string, monthStr: string, yearStr: string) => {
  if (!checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
    throw new Error(ErrorMessages.ENTER_DATE);
  }
  else if (dayStr === "") {
    throw new Error(ErrorMessages.DAY);
  }
  else if(!checkIsNumber(dayStr)){
    throw new Error(ErrorMessages.DAY_INVALID_CHARACTER);
  }
  else if (checkIsNumber(dayStr) && checkIsNumber(monthStr) && checkIsNumber(yearStr)) {
    checkDateValueIsValid(dayStr, monthStr, yearStr);
  }
  return true;
};

export const checkDateFieldMonth = (dayStr: string, monthStr: string, yearStr: string) => {
  if (monthStr === "" && dayStr !== "") {
    throw new Error(ErrorMessages.MONTH);
  }
  else if(dayStr !== "" && yearStr !== "" && checkIsNumber(dayStr) && !checkIsNumber(monthStr)){
    throw new Error(ErrorMessages.MONTH_INVALID_CHARACTER);
  }
  return true;
};

export const checkDateFieldYear = (dayStr: string, monthStr: string, yearStr: string) => {
  if (yearStr === "" && dayStr !== "" && monthStr !== "") {
      throw new Error(ErrorMessages.YEAR);
    }
  else if(dayStr !== "" && monthStr !== "" && checkIsNumber(dayStr) && checkIsNumber(monthStr) && !checkIsNumber(yearStr)){
    throw new Error(ErrorMessages.YEAR_INVALID_CHARACTER);
  }
  return true;
};




