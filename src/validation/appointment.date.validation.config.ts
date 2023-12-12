import { appointmentDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { DateValidationType } from "../model/validation.model";
import { AppointmentDateField } from "../model/date.model";

// Configuration required for date validation error messages
export const AppointmentDateValidation: DateValidationType = {
    MissingValue: {
        Day: {
            messageKey: appointmentDateErrorMessageKey.MISSING_DAY,
            source: [AppointmentDateField.DAY],
            link: AppointmentDateField.DAY
        },
        Month: {
            messageKey: appointmentDateErrorMessageKey.MISSING_MONTH,
            source: [AppointmentDateField.MONTH],
            link: AppointmentDateField.MONTH
        },
        Year: {
            messageKey: appointmentDateErrorMessageKey.MISSING_YEAR,
            source: [AppointmentDateField.YEAR],
            link: AppointmentDateField.YEAR
        },
        DayMonth: {
            messageKey: appointmentDateErrorMessageKey.MISSING_DAY_MONTH,
            source: [AppointmentDateField.DAY, AppointmentDateField.MONTH],
            link: AppointmentDateField.DAY
        },
        DayYear: {
            messageKey: appointmentDateErrorMessageKey.MISSING_DAY_YEAR,
            source: [AppointmentDateField.DAY, AppointmentDateField.YEAR],
            link: AppointmentDateField.DAY
        },
        MonthYear: {
            messageKey: appointmentDateErrorMessageKey.MISSING_MONTH_YEAR,
            source: [AppointmentDateField.MONTH, AppointmentDateField.YEAR],
            link: AppointmentDateField.MONTH
        },
        DayMonthYear: {
            messageKey: appointmentDateErrorMessageKey.MISSING_DAY_MONTH_YEAR,
            source: [AppointmentDateField.DAY, AppointmentDateField.MONTH, AppointmentDateField.YEAR],
            link: AppointmentDateField.DAY
        },
    },
    InvalidValue: {
        Day: {
            messageKey: appointmentDateErrorMessageKey.INVALID_DATE,
            source: [AppointmentDateField.DAY],
            link: AppointmentDateField.DAY
        },
        Month: {
            messageKey: appointmentDateErrorMessageKey.INVALID_DATE,
            source: [AppointmentDateField.MONTH],
            link: AppointmentDateField.MONTH
        },
        Year: {
            messageKey: appointmentDateErrorMessageKey.INVALID_DATE,
            source: [AppointmentDateField.YEAR],
            link: AppointmentDateField.YEAR
        },
        DayMonth: {
            messageKey: appointmentDateErrorMessageKey.INVALID_DATE,
            source: [AppointmentDateField.DAY, AppointmentDateField.MONTH],
            link: AppointmentDateField.DAY
        },
        DayYear: {
            messageKey: appointmentDateErrorMessageKey.INVALID_DATE,
            source: [AppointmentDateField.DAY, AppointmentDateField.YEAR],
            link: AppointmentDateField.DAY
        },
        MonthYear: {
            messageKey: appointmentDateErrorMessageKey.INVALID_DATE,
            source: [AppointmentDateField.MONTH, AppointmentDateField.YEAR],
            link: AppointmentDateField.MONTH
        },
        DayMonthYear: {
            messageKey: appointmentDateErrorMessageKey.INVALID_DATE,
            source: [AppointmentDateField.DAY, AppointmentDateField.MONTH, AppointmentDateField.YEAR],
            link: AppointmentDateField.DAY
        },
    },
    RuleBased: {
        Underage: {
            messageKey: appointmentDateErrorMessageKey.APPOINTMENT_DATE_UNDERAGE,
            source: [AppointmentDateField.DAY, AppointmentDateField.MONTH, AppointmentDateField.YEAR],
            link: AppointmentDateField.DAY
        },
        FutureDate: {
            messageKey: appointmentDateErrorMessageKey.IN_PAST,
            source: [AppointmentDateField.DAY, AppointmentDateField.MONTH, AppointmentDateField.YEAR],
            link: AppointmentDateField.DAY
        },
        IncorporationDate: {
            messageKey: appointmentDateErrorMessageKey.AFTER_INCORPORATION_DATE,
            source: [AppointmentDateField.DAY, AppointmentDateField.MONTH, AppointmentDateField.YEAR],
            link: AppointmentDateField.DAY
        }
    }
}