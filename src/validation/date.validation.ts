import { DateTime } from "luxon";
import { RemovalDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { DateValidationType, ValidationError } from "../model/validation.model";
import { RemovalDateField } from "../model/date.model";


// Configuration required for date validation error messages
const DateValidation: DateValidationType = {
  MissingValue: {
      Day: {
          messageKey: RemovalDateErrorMessageKey.MISSING_DAY,
          source: [RemovalDateField.DAY],
          link: RemovalDateField.DAY
      },
      Month: {
          messageKey: RemovalDateErrorMessageKey.MISSING_MONTH,
          source: [RemovalDateField.MONTH],
          link: RemovalDateField.MONTH
      },
      Year: {
          messageKey: RemovalDateErrorMessageKey.MISSING_YEAR,
          source: [RemovalDateField.YEAR],
          link: RemovalDateField.YEAR
      },
      DayMonth: {
          messageKey: RemovalDateErrorMessageKey.MISSING_DAY_MONTH,
          source: [RemovalDateField.DAY, RemovalDateField.MONTH],
          link: RemovalDateField.DAY
      },
      DayYear: {
          messageKey: RemovalDateErrorMessageKey.MISSING_DAY_YEAR,
          source: [RemovalDateField.DAY, RemovalDateField.YEAR],
          link: RemovalDateField.DAY
      },
      MonthYear: {
          messageKey: RemovalDateErrorMessageKey.MISSING_MONTH_YEAR,
          source: [RemovalDateField.MONTH, RemovalDateField.YEAR],
          link: RemovalDateField.MONTH
      },
      DayMonthYear: {
          messageKey: RemovalDateErrorMessageKey.MISSING_DAY_MONTH_YEAR,
          source: [RemovalDateField.DAY, RemovalDateField.MONTH, RemovalDateField.YEAR],
          link: RemovalDateField.DAY
      },
  },
  InvalidValue: {
      Day: {
          messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
          source: [RemovalDateField.DAY],
          link: RemovalDateField.DAY
      },
      Month: {
          messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
          source: [RemovalDateField.MONTH],
          link: RemovalDateField.MONTH
      },
      Year: {
          messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
          source: [RemovalDateField.YEAR],
          link: RemovalDateField.YEAR
      },
      DayMonth: {
          messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
          source: [RemovalDateField.DAY, RemovalDateField.MONTH],
          link: RemovalDateField.DAY
      },
      DayYear: {
          messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
          source: [RemovalDateField.DAY, RemovalDateField.YEAR],
          link: RemovalDateField.DAY
      },
      MonthYear: {
          messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
          source: [RemovalDateField.MONTH, RemovalDateField.YEAR],
          link: RemovalDateField.MONTH
      },
      DayMonthYear: {
          messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
          source: [RemovalDateField.DAY, RemovalDateField.MONTH, RemovalDateField.YEAR],
          link: RemovalDateField.DAY
      },
  }
}

/**
 * Validate date field - checks for missing values, non-numeric characters
 * @returns A ValidationError object if one occurred, else undefined
 */
export const validateDate = (dayStr: string, monthStr: string, yearStr: string): ValidationError | undefined => {
  // Missing values
  const missingValuesValidationResult = validateMissingValues(dayStr, monthStr, yearStr);
  if (missingValuesValidationResult) {
    return missingValuesValidationResult;
  }

  // Invalid values
  const invalidValuesValidationResult = validateInvalidValues(dayStr, monthStr, yearStr);
  if (invalidValuesValidationResult) {
    return invalidValuesValidationResult;
  }

  // Date cannot exist
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  if( !DateTime.utc(year, month, day).isValid){
    return DateValidation.InvalidValue.DayMonthYear;
  }
  return undefined;
}

/**
 * Validate the date fields and return a validation error if any of the fields are empty 
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateMissingValues = (dayStr: string, monthStr: string, yearStr: string): ValidationError | undefined => {
  if(dayStr === "" && monthStr !== "" && yearStr !== "") {
    return DateValidation.MissingValue.Day;
  }
  else if(dayStr !== "" && monthStr === "" && yearStr !== "") {
    return DateValidation.MissingValue.Month;
  } 
  else if(dayStr !== "" && monthStr !== "" && yearStr === "") {
    return DateValidation.MissingValue.Year;
  } 
  else if(dayStr === "" && monthStr === "" && yearStr !== "") {
    return DateValidation.MissingValue.DayMonth;
  } 
  else if(dayStr === "" && monthStr !== "" && yearStr === "") {
    return DateValidation.MissingValue.DayYear;
  } 
  else if(dayStr !== "" && monthStr === "" && yearStr === "") {
    return DateValidation.MissingValue.MonthYear
  } 
  else if (dayStr === "" && monthStr === "" && yearStr === "") {
    return DateValidation.MissingValue.DayMonthYear;
  }
  return undefined;
}

/**
 * Validate the date fields and return a validation error if any of the fields contain non-numeric characters
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateInvalidValues = (dayStr: string, monthStr: string, yearStr: string): ValidationError | undefined => {
  const validDay = checkIsNumber(dayStr), validMonth = checkIsNumber(monthStr), validYear = checkIsValidYear(yearStr);
  if (!validDay && validMonth && validYear) {
    return DateValidation.InvalidValue.Day;
  }
  else if (validDay && !validMonth && validYear) {
    return DateValidation.InvalidValue.Month;
  }
  else if (validDay && validMonth && !validYear) {
    return DateValidation.InvalidValue.Year;
  }
  else if (!validDay && !validMonth && validYear) {
    return DateValidation.InvalidValue.DayMonth;
  }
  else if (!validDay && validMonth && !validYear) {
    return DateValidation.InvalidValue.DayYear;
  }
  else if (validDay && !validMonth && !validYear) {
    return DateValidation.InvalidValue.MonthYear;
  }
  else if (!validDay && !validMonth && !validYear) {
    return DateValidation.InvalidValue.DayMonthYear;
  }
  return undefined;
}

const checkIsNumber = (numStr: string) => {
  return numStr.match("^[0-9]+$");
}

const checkIsValidYear = (numStr: string) => {
  return numStr.match("^[0-9]{4}$");
}
