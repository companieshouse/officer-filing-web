import { DateTime } from "luxon";
import { DateValidationType, ValidationError } from "../model/validation.model";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

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
 * Validate the date of birth field and return a validation error if any of the fields fail validation
 * @returns A ValidationError object if one occurred, else undefined
 */
export const validateDateOfBirth = (dayStr: string, monthStr: string, yearStr: string, dateValidationType: DateValidationType): ValidationError | undefined => {
  const dateError = validateDate(dayStr, monthStr, yearStr, dateValidationType);
  if(dateError){
    return dateError;
  }
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  const dateOfBirth = new Date(year, month - 1, day);
  return validateDateOfBirthRules(dateOfBirth, dateValidationType);
}

/**
 * Validate the date of appointment field and return a validation error if any of the fields fail validation
 * @returns A ValidationError object if one occurred, else undefined
 */
export const validateDateOfAppointment = (dayStr: string, monthStr: string, yearStr: string, dateValidationType: DateValidationType, dateOfBirth: Date, companyProfile: CompanyProfile): ValidationError | undefined => {
  const dateError = validateDate(dayStr, monthStr, yearStr, dateValidationType);
  if(dateError){
    return dateError;
  }
  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  const dateOfAppointment = new Date(year, month - 1, day);
  return validateDateOfAppointmentRules(dateOfBirth, dateOfAppointment, dateValidationType, companyProfile);
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

const getAge = (dateOfBirth: Date) => {
  const diffMs = Date.now() - dateOfBirth.getTime();
  return Math.abs(new Date(diffMs).getUTCFullYear() - 1970);
}

/**
 * Validate rules relating to date of birth
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateDateOfBirthRules = (dateOfBirth: Date, dateValidationType: DateValidationType): ValidationError | undefined => {
  const underageValidation = validateUnderageRule(dateOfBirth, dateValidationType);
  if(underageValidation){
    return underageValidation;
  }
  if(getAge(dateOfBirth) > 110){
    return dateValidationType.RuleBased?.Overage;
  }
  return undefined;
}

/**
 * Validate rules relating to date of appointment
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateDateOfAppointmentRules = (dateOfBirth: Date, dateOfAppointment: Date, dateValidationType: DateValidationType, companyProfile: CompanyProfile): ValidationError | undefined => {
  const futureDateValidation = validateFutureDateRule(dateOfAppointment, dateValidationType);
  if(futureDateValidation){
    return futureDateValidation;
  }
  const incorporationDateValidation = validateAppointmentAfterIncorporationDate(dateOfAppointment, dateValidationType, companyProfile);
  if(incorporationDateValidation){
    return incorporationDateValidation;
  }
  const underageValidation = validateUnderageAtAppointmentRule(dateOfBirth, dateOfAppointment, dateValidationType);
  if(underageValidation){
    return underageValidation;
  }
  return undefined;
}

/**
 * Validate whether a director is under the age of 16
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateUnderageRule = (dateOfBirth: Date, dateValidationType: DateValidationType): ValidationError | undefined => {
  if(dateOfBirth > new Date()){
    return dateValidationType.RuleBased?.Underage;
  }
  if(getAge(dateOfBirth) < 16){
    return dateValidationType.RuleBased?.Underage;
  }
  return undefined;
}

/**
 * Validate whether a director would be under the age of 16 on the date of appointment
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateUnderageAtAppointmentRule = (dateOfBirth: Date, dateOfAppointment: Date,dateValidationType: DateValidationType): ValidationError | undefined => {
  if(getAge(dateOfBirth) - getAge(dateOfAppointment) < 16){
    return dateValidationType.RuleBased?.Underage;
  }
  return undefined;
}

/**
 * Validate whether a date of appointment is in the future
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateFutureDateRule = (dateOfAppointment: Date, dateValidationType: DateValidationType): ValidationError | undefined => {
  if(dateOfAppointment > new Date()){
    return dateValidationType.RuleBased?.FutureDate;
  }
}

/**
 * Validate whether a date of appointment is after the date of incorporation
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateAppointmentAfterIncorporationDate = (dateOfAppointment: Date, dateValidationType: DateValidationType, companyProfile: CompanyProfile): ValidationError | undefined => {
  if(dateOfAppointment < new Date(companyProfile.dateOfCreation)){
    return dateValidationType.RuleBased?.IncorporationDate;
  }
}

