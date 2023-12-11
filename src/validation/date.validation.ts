import { DateTime } from "luxon";
import { DateValidationType, ValidationError } from "../model/validation.model";

/**
 * Validate date field - checks for missing values, non-numeric characters
 * @returns A ValidationError object if one occurred, else undefined
 */
export const validateDate = (dayStr: string, monthStr: string, yearStr: string, dateValidationType: DateValidationType): ValidationError | undefined => {
  // Missing values
  const missingValuesValidationResult = validateMissingValues(dayStr, monthStr, yearStr, dateValidationType);
  if (missingValuesValidationResult) {
    return missingValuesValidationResult;
  }

  // Invalid values
  const invalidValuesValidationResult = validateInvalidValues(dayStr, monthStr, yearStr, dateValidationType);
  if (invalidValuesValidationResult) {
    return invalidValuesValidationResult;
  }

  // Date cannot exist
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  if( !DateTime.utc(year, month, day).isValid){
    return dateValidationType.InvalidValue.DayMonthYear;
  }
  return undefined;
}

/**
 * Validate the date fields and return a validation error if any of the fields are empty 
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateMissingValues = (dayStr: string, monthStr: string, yearStr: string, dateValidationType: DateValidationType): ValidationError | undefined => {
  if(dayStr === "" && monthStr !== "" && yearStr !== "") {
    return dateValidationType.MissingValue.Day;
  }
  else if(dayStr !== "" && monthStr === "" && yearStr !== "") {
    return dateValidationType.MissingValue.Month;
  } 
  else if(dayStr !== "" && monthStr !== "" && yearStr === "") {
    return dateValidationType.MissingValue.Year;
  } 
  else if(dayStr === "" && monthStr === "" && yearStr !== "") {
    return dateValidationType.MissingValue.DayMonth;
  } 
  else if(dayStr === "" && monthStr !== "" && yearStr === "") {
    return dateValidationType.MissingValue.DayYear;
  } 
  else if(dayStr !== "" && monthStr === "" && yearStr === "") {
    return dateValidationType.MissingValue.MonthYear
  } 
  else if (dayStr === "" && monthStr === "" && yearStr === "") {
    return dateValidationType.MissingValue.DayMonthYear;
  }
  return undefined;
}

/**
 * Validate the date fields and return a validation error if any of the fields contain non-numeric characters
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateInvalidValues = (dayStr: string, monthStr: string, yearStr: string, dateValidationType: DateValidationType): ValidationError | undefined => {
  const validDay = checkIsNumber(dayStr), validMonth = checkIsNumber(monthStr), validYear = checkIsValidYear(yearStr);
  if (!validDay && validMonth && validYear) {
    return dateValidationType.InvalidValue.Day;
  }
  else if (validDay && !validMonth && validYear) {
    return dateValidationType.InvalidValue.Month;
  }
  else if (validDay && validMonth && !validYear) {
    return dateValidationType.InvalidValue.Year;
  }
  else if (!validDay && !validMonth && validYear) {
    return dateValidationType.InvalidValue.DayMonth;
  }
  else if (!validDay && validMonth && !validYear) {
    return dateValidationType.InvalidValue.DayYear;
  }
  else if (validDay && !validMonth && !validYear) {
    return dateValidationType.InvalidValue.MonthYear;
  }
  else if (!validDay && !validMonth && !validYear) {
    return dateValidationType.InvalidValue.DayMonthYear;
  }
  return undefined;
}

const checkIsNumber = (numStr: string) => {
  return numStr.match("^(?!00$)[0-9]{1,2}$");
}

const checkIsValidYear = (numStr: string) => {
  return numStr.match("^[0-9]{4}$");
}
