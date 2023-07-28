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
