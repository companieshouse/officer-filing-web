import { DateTime } from "luxon";
import { DateValidationType, ValidationError } from "../model/validation.model";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

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
 * Validate the date of change field and return a validation error if any of the fields fail validation
 * @returns A ValidationError object if one occurred, else undefined
 */
export const validateDateOfChange = (dayStr: string, monthStr: string, yearStr: string, dateValidationType: DateValidationType, companyProfile: CompanyProfile, officerFiling: OfficerFiling): ValidationError | undefined => {
  const dateError = validateDate(dayStr, monthStr, yearStr, dateValidationType);
  if(dateError){
    return dateError;
  }

  const day = parseInt(dayStr), month = parseInt(monthStr), year = parseInt(yearStr);
  const dateOfChange = new Date(year, month - 1, day);
  return validateDateOfChangeRules(dateOfChange, dateValidationType, companyProfile, officerFiling);
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

/**
 * Validate rules relating to date of birth
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateDateOfBirthRules = (dateOfBirth: Date, dateValidationType: DateValidationType): ValidationError | undefined => {
  const underageValidation = validateUnderageRule(dateOfBirth, dateValidationType);
  if(underageValidation){
    return underageValidation;
  }
  if(checkNotOverage(dateOfBirth)){
    return dateValidationType.RuleBased?.Overage;
  }
  return undefined;
}

const checkNotOverage = (dateOfBirth: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateOfBirthPlus110 = new Date(dateOfBirth);
  dateOfBirthPlus110.setFullYear(dateOfBirthPlus110.getFullYear() + 110);
  return dateOfBirthPlus110 < today;
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
  const incorporationDateValidation = validateDateAfterIncorporationDate(dateOfAppointment, dateValidationType, companyProfile);
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
 * Validate rules relating to date of change in director's details
 * @returns A ValidationError object if one occurred, else undefined
 */

const validateDateOfChangeRules = (dateOfChange: Date, dateValidationType: DateValidationType, companyProfile: CompanyProfile, officerFiling: OfficerFiling): ValidationError | undefined => {
  const before2009Validation = validateDateBefore2009Oct01(dateOfChange, dateValidationType);
  if(before2009Validation){
    return before2009Validation;
  }
  const incorporationDateValidation = validateDateAfterIncorporationDate(dateOfChange, dateValidationType, companyProfile);
  if(incorporationDateValidation){
    return incorporationDateValidation;
  }
  const appointmentDateValidation = validateChangeOfDateBeforeAppointment(dateOfChange, dateValidationType, officerFiling);
  if(appointmentDateValidation){
    return appointmentDateValidation;
  }
  const futureDateValidation = validateFutureDateRule(dateOfChange, dateValidationType);
  if(futureDateValidation){
    return futureDateValidation;
  }
  return undefined;
}

/**
 * Validate whether a director is under the age of 16
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateUnderageRule = (dateOfBirth: Date, dateValidationType: DateValidationType): ValidationError | undefined => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if(dateOfBirth > today){
    return dateValidationType.RuleBased?.Underage;
  }

  const dateOfBirthPlus16 = new Date(dateOfBirth);
  dateOfBirthPlus16.setFullYear(dateOfBirthPlus16.getFullYear() + 16);
  if(dateOfBirthPlus16 > today){
    return dateValidationType.RuleBased?.Underage;
  }
  return undefined;
}

/**
 * Validate whether a director would be under the age of 16 on the date of appointment
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateUnderageAtAppointmentRule = (dateOfBirth: Date, dateOfAppointment: Date,dateValidationType: DateValidationType): ValidationError | undefined => {
  const dateOfBirthPlus16 = new Date(dateOfBirth);
  dateOfBirthPlus16.setFullYear(dateOfBirthPlus16.getFullYear() + 16);

  if(dateOfBirthPlus16 > dateOfAppointment){
    return dateValidationType.RuleBased?.Underage;
  }
  return undefined;
}

/**
 * Validate whether a date of appointment is in the future
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateFutureDateRule = (date: Date, dateValidationType: DateValidationType): ValidationError | undefined => {
  if(date > new Date()){
    return dateValidationType.RuleBased?.FutureDate;
  }
}

/**
 * Validate whether a date of appointment is after the date of incorporation
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateDateAfterIncorporationDate = (date: Date, dateValidationType: DateValidationType, companyProfile: CompanyProfile): ValidationError | undefined => {
  if(date < new Date(companyProfile.dateOfCreation)){
    return dateValidationType.RuleBased?.IncorporationDate;
  }
}
/**
 * Validate whether a date is before the date of appointment
 * @param date 
 * @param dateValidationType 
 * @param officerFiling 
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateChangeOfDateBeforeAppointment = (date: Date, dateValidationType: DateValidationType, officerFiling: OfficerFiling): ValidationError | undefined => {
  if(officerFiling.appointedOn && date < new Date(officerFiling.appointedOn)){
    return dateValidationType.RuleBased?.DateOfChangeBeforeAppointment;
  }
}

/**
 * Validate whether a date is before 2009-10-01
 * @param date 
 * @param dateValidationType 
 * @returns 
 */

const validateDateBefore2009Oct01 = (date: Date, dateValidationType: DateValidationType): ValidationError | undefined => {
  if(date < new Date("2009-10-01")){
    return dateValidationType.RuleBased?.Before2009;
  }
}
