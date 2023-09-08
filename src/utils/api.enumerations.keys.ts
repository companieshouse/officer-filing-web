/**
 * General error message keys
 */
export enum ErrorMessageKey {
  COMPANY_DISSOLVED = "company-dissolved",
  ETAG_INVALID = "etag-invalid"
}

/**
 * Error message keys relating to the date of removal
 */
export enum RemovalDateErrorMessageKey {
  MISSING_DAY = "removal-date-missing-day",
  MISSING_MONTH = "removal-date-missing-month",
  MISSING_YEAR = "removal-date-missing-year",
  MISSING_DAY_MONTH = "removal-date-missing-day-month",
  MISSING_DAY_YEAR = "removal-date-missing-day-year",
  MISSING_MONTH_YEAR = "removal-date-missing-month-year",
  MISSING_DAY_MONTH_YEAR = "removal-date-missing-day-month-year",
  INVALID_DATE = "removal-date-invalid",
  IN_PAST = "removal-date-in-past",
  AFTER_APPOINTMENT_DATE = "removal-date-after-appointment-date",
  AFTER_INCORPORATION_DATE = "removal-date-after-incorporation-date",
  AFTER_2009 = "removal-date-after-2009"
}

export enum titleErrorMessageKey {
  TITLE_CHARACTERS = "title-characters",
  TITLE_LENGTH = "title-length",
}

export enum firstNameErrorMessageKey {
  FIRST_NAME_BLANK = "first-name-blank",
  FIRST_NAME_CHARACTERS = "first-name-characters",
  FIRST_NAME_LENGTH = "first-name-length",
}

export enum middleNameErrorMessageKey {
  MIDDLE_NAME_CHARACTERS = "middle-name-characters",
  MIDDLE_NAME_LENGTH = "middle-name-length",
}

export enum lastNameErrorMessageKey {
  LAST_NAME_BLANK = "last-name-blank",
  LAST_NAME_CHARACTERS = "last-name-characters",
  LAST_NAME_LENGTH = "last-name-length",
}

export enum formerNamesErrorMessageKey {
  FORMER_NAMES_RADIO_UNSELECTED = "Select yes if the director used a different name for business purposes in the last 20 years",
  FORMER_NAMES_MISSING = "Enter the director’s previous name or names",
  FORMER_NAMES_CHARACTERS = "former-names-characters",
  FORMER_NAMES_LENGTH = "former-names-length"
}

export enum occupationErrorMessageKey {
  OCCUPATION_CHARACTERS = "occupation-characters",
  OCCUPATION_LENGTH = "occupation-length"
}