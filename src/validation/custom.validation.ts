// Custom validation utils - For now checking is not empty

import { DateTime } from "luxon";
import { ErrorMessages } from "./error.messages";
import { logger } from "../utils/logger";


export const checkDateIsNotCompletelyEmpty = (day: string = "", month: string = "", year: string = "") => {
  if ( !day.trim() && !month.trim() && !year.trim() ) {
    return false;
  }
  return true;
};

export const checkDateIsInPast = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const currentDate = DateTime.utc(now.year, now.month, now.day); // exclude time of day
  if (inputDate >= currentDate) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateIsInPastOrToday = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const currentDate = DateTime.utc(now.year, now.month, now.day); // exclude time of day
  if (inputDate > currentDate) {
    throw new Error(errMsg);
  }
  return true;
};

export const checkDateIsWithinLast3Months = (errMsg: string, day: string = "", month: string = "", year: string = "") => {
  const inputDate = DateTime.utc(Number(year), Number(month), Number(day));
  const now = DateTime.now();
  const threeMonthOldDate = DateTime.utc(now.year, now.month, now.day).minus({ months: 3 });
  if (inputDate <= threeMonthOldDate) {
    throw new Error(errMsg);
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

export const isYearEitherMissingOrCorrectLength = (yearStr: string = ""): boolean => {
  return (yearStr.length === 0 || yearStr.length === 4);
};

export const checkRemovalDate = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  // to prevent more than 1 error reported on the date fields we first check for multiple empty fields and then check if the year is correct length or missing before doing the date check as a whole.
  if (checkMoreThanOneDateFieldIsNotMissing(dayStr, monthStr, yearStr)
  && isYearEitherMissingOrCorrectLength(yearStr)
  && checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
    checkRemovalDateFields(dayStr, monthStr, yearStr);
  }
  return true;
};

const checkRemovalDateFields = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  const areAllDateFieldsPresent = checkAllDateFieldsArePresent(dayStr, monthStr, yearStr);
  if (areAllDateFieldsPresent) {
    const isDateValid = checkDateValueIsValid(ErrorMessages.INVALID_DATE, dayStr, monthStr, yearStr);
    if (isDateValid) {
      checkDateIsInPastOrToday(ErrorMessages.DATE_NOT_IN_PAST_OR_TODAY, dayStr, monthStr, yearStr);
    }
  }
};

export const checkDateFieldDay = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (isYearEitherMissingOrCorrectLength(yearStr)) {
    if (dayStr === "" && monthStr !== "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY);
    } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY_AND_MONTH);
    } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
      throw new Error(ErrorMessages.DAY_AND_YEAR);
    } else {
      if (!checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
        throw new Error(ErrorMessages.ENTER_DATE);
      }
    }
  }
  return true;
};

export const checkDateFieldDayOfBirth = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (isYearEitherMissingOrCorrectLength(yearStr)) {
    if (dayStr === "" && monthStr !== "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY_OF_BIRTH);
    } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY_AND_MONTH_OF_BIRTH);
    } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
      throw new Error(ErrorMessages.DAY_AND_YEAR_OF_BIRTH);
    } else {
      if (!checkDateIsNotCompletelyEmpty(dayStr, monthStr, yearStr)) {
        throw new Error(ErrorMessages.ENTER_DATE_OF_BIRTH);
      }
    }
  }
  return true;
};

export const checkDateFieldDayForOptionalDates = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (isYearEitherMissingOrCorrectLength(yearStr)) {
    if (dayStr === "" && monthStr !== "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY);
    } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
      throw new Error(ErrorMessages.DAY_AND_MONTH);
    } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
      throw new Error(ErrorMessages.DAY_AND_YEAR);
    }
  }
  return true;
};

export const checkDateFieldMonth = (monthMissingMessage: string, monthYearMissingMessage: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (isYearEitherMissingOrCorrectLength(yearStr)) {
    if (monthStr === "" && dayStr !== "" && yearStr !== "") {
      throw new Error(monthMissingMessage);
    } else if (dayStr !== "" && monthStr === "" && yearStr === "") {
      throw new Error(monthYearMissingMessage);
    }
  }
  return true;
};

export const checkDateFieldYear = (yearMissingMessage: string, yearLengthMessage: string, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (!isYearEitherMissingOrCorrectLength(yearStr)) {
    throw new Error(yearLengthMessage);
  } else if (checkMoreThanOneDateFieldIsNotMissing(dayStr, monthStr, yearStr)) {
    if (yearStr === "" && dayStr !== "" && monthStr !== "") {
      throw new Error(yearMissingMessage);
    }
  }
  return true;
};

const checkAllDateFieldsArePresent = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if (dayStr === "" || monthStr === "" || yearStr === "") {
    return false;
  }
  return true;
};

const checkMoreThanOneDateFieldIsNotMissing = (dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  if ((dayStr === "" && monthStr === "" && yearStr !== "") ||
     (dayStr !== "" && monthStr === "" && yearStr === "") ||
     (dayStr === "" && monthStr !== "" && yearStr === "")) {
    return false;
  }
  return true;
};

export type DateFieldErrors = Partial<{
  completelyEmptyDateError: ErrorMessages,
  noDayAndMonthError: ErrorMessages,
  noMonthAndYearError: ErrorMessages,
  noDayAndYearError: ErrorMessages,
}>;

const defaultDateFieldErrors: DateFieldErrors = {
  completelyEmptyDateError: ErrorMessages.ENTER_DATE,
  noDayAndMonthError: ErrorMessages.DAY_AND_MONTH,
  noMonthAndYearError: ErrorMessages.MONTH_AND_YEAR,
  noDayAndYearError: ErrorMessages.DAY_AND_YEAR,
};

export type DayFieldErrors = {
  noDayError: ErrorMessages,
  wrongDayLength: ErrorMessages,
};

export type MonthFieldErrors = {
  noMonthError: ErrorMessages,
  wrongMonthLength: ErrorMessages,
};

export type YearFieldErrors = {
  noYearError: ErrorMessages,
  wrongYearLength: ErrorMessages,
};

const checkDateFieldsForErrors = (dateErrors: DateFieldErrors, dayStr: string = "", monthStr: string = "", yearStr: string = "") => {
  dateErrors = { ...defaultDateFieldErrors, ...dateErrors };
  if (dayStr === "" && monthStr === "" && yearStr === "") {
    throw new Error(dateErrors.completelyEmptyDateError);
  } else if (dayStr === "" && monthStr === "" && yearStr !== "") {
    throw new Error(dateErrors.noDayAndMonthError);
  } else if (dayStr !== "" && monthStr === "" && yearStr === "") {
    throw new Error(dateErrors.noMonthAndYearError);
  } else if (dayStr === "" && monthStr !== "" && yearStr === "") {
    throw new Error(dateErrors.noDayAndYearError);
  }
  return true;
};

export const checkDayFieldForErrors = (dateErrors: DayFieldErrors, dayStr: string) => {
  if (dayStr === "") {
    throw new Error(dateErrors.noDayError);
  } else if (dayStr.length > 2){
    throw new Error(dateErrors.wrongDayLength);
  }
  return true;
};

export const checkMonthFieldForErrors = (dateErrors: MonthFieldErrors, monthStr: string) => {
  if (monthStr === "") {
    throw new Error(dateErrors.noMonthError);
  } else if (monthStr.length > 2){
    throw new Error(dateErrors.wrongMonthLength);
  }
  return true;
};

export const checkYearFieldForErrors = (dateErrors: YearFieldErrors, yearStr: string) => {
  if (yearStr === "") {
    throw new Error(dateErrors.noYearError);
  } else if (yearStr.length !== 4){
    throw new Error(dateErrors.wrongYearLength);
  }
  return true;
};

export const checkAtLeastOneFieldHasValue = (errMsg: string, ...fields: any[]) => {
  for (const field of fields) {
    if (field) {
      return true;
    }
  }
  throw new Error(errMsg);
};




