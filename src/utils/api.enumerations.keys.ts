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

/**
 * Error message keys relating to the date of birth
 */
export enum dobDateErrorMessageKey {
  MISSING_DAY = "dob-date-missing-day",
  MISSING_MONTH = "dob-date-missing-month",
  MISSING_YEAR = "dob-date-missing-year",
  MISSING_DAY_MONTH = "dob-date-missing-day-month",
  MISSING_DAY_YEAR = "dob-date-missing-day-year",
  MISSING_MONTH_YEAR = "dob-date-missing-month-year",
  MISSING_DAY_MONTH_YEAR = "dob-date-missing-day-month-year",
  INVALID_DATE = "dob-date-invalid",
  DIRECTOR_UNDERAGE = "date-of-birth-underage",
  DIRECTOR_OVERAGE = "date-of-birth-overage"
}

/**
 * Error message keys relating to the date of appointment
 */
export enum appointmentDateErrorMessageKey {
  MISSING_DAY = "appointment-date-missing-day",
  MISSING_MONTH = "appointment-date-missing-month",
  MISSING_YEAR = "appointment-date-missing-year",
  MISSING_DAY_MONTH = "appointment-date-missing-day-month",
  MISSING_DAY_YEAR = "appointment-date-missing-day-year",
  MISSING_MONTH_YEAR = "appointment-date-missing-month-year",
  MISSING_DAY_MONTH_YEAR = "appointment-date-missing-day-month-year",
  INVALID_DATE = "appointment-date-invalid",
  IN_PAST = "appointment-date-in-past",
  AFTER_INCORPORATION_DATE = "appointment-date-after-incorporation-date",
  APPOINTMENT_DATE_UNDERAGE = "appointment-date-underage",
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

export enum nationalityErrorMessageKey{
  NATIONALITY_INVALID = "invalid-nationality"
}

export enum nationalityOneErrorMessageKey {
  NATIONALITY_MISSING = "nationality-blank",
  NATIONALITY_LENGTH_50 = "nationality-length",
  NATIONALITY_LENGTH_48 = "nationality-length48",
  NATIONALITY_LENGTH_49 = "nationality-length49",
}

export enum nationalityTwoErrorMessageKey {
  NATIONALITY_LENGTH_48 = "nationality-length48",
  NATIONALITY_LENGTH_49 = "nationality-length49",
  NATIONALITY_2_DUPLICATE = "duplicate-nationality2",
}

export enum nationalityThreeErrorMessageKey {
  NATIONALITY_LENGTH_48 = "nationality-length48",
  NATIONALITY_3_DUPLICATE = "duplicate-nationality3"
}


export enum residentialAddressPremisesErrorMessageKey {
  RESIDENTIAL_ADDRESS_PREMISES_BLANK = "residential-premises-blank",
  RESIDENTIAL_ADDRESS_PREMISES_CHARACTERS = "residential-premises-characters",
  RESIDENTIAL_ADDRESS_PREMISES_LENGTH = "residential-premises-length",
}

export enum residentialAddressAddressLineOneErrorMessageKey {
  RESIDENTIAL_ADDRESS_ADDRESS_LINE_1_BLANK = "residential-address-line-one-blank",
  RESIDENTIAL_ADDRESS_ADDRESS_LINE_1_CHARACTERS = "residential-address-line-one-characters",
  RESIDENTIAL_ADDRESS_ADDRESS_LINE_1_LENGTH = "residential-address-line-one-length",
}

export enum residentialAddressAddressLineTwoErrorMessageKey {
  RESIDENTIAL_ADDRESS_ADDRESS_LINE_2_CHARACTERS = "residential-address-line-two-characters",
  RESIDENTIAL_ADDRESS_ADDRESS_LINE_2_LENGTH = "residential-address-line-two-length",
}

export enum residentialAddressLocalityErrorMessageKey {
  RESIDENTIAL_ADDRESS_LOCALITY_BLANK = "residential-locality-blank",
  RESIDENTIAL_ADDRESS_LOCALITY_CHARACTERS = "residential-locality-characters",
  RESIDENTIAL_ADDRESS_LOCALITY_LENGTH = "residential-locality-length",
}

export enum residentialAddressRegionErrorMessageKey {
  RESIDENTIAL_ADDRESS_REGION_BLANK = "residential-region-blank",
  RESIDENTIAL_ADDRESS_REGION_CHARACTERS = "residential-region-characters",
  RESIDENTIAL_ADDRESS_REGION_LENGTH = "residential-region-length",
}

export enum residentialAddressCountryErrorMessageKey {
  RESIDENTIAL_ADDRESS_COUNTRY_BLANK = "residential-country-blank",
  RESIDENTIAL_ADDRESS_COUNTRY_CHARACTERS = "residential-country-characters",
  RESIDENTIAL_ADDRESS_COUNTRY_LENGTH = "residential-country-length",
}

export enum residentialAddressPostcodeErrorMessageKey {
  RESIDENTIAL_ADDRESS_POSTAL_CODE_BLANK = "residential-postal-code-blank",
  RESIDENTIAL_ADDRESS_POSTAL_CODE_CHARACTERS = "residential-postal-code-characters",
  RESIDENTIAL_ADDRESS_POSTAL_CODE_LENGTH = "residential-postal-code-length",
  RESIDENTIAL_ADDRESS_POSTAL_CODE_WITHOUT_COUNTRY = "residential-postal-code-without-country",
}
