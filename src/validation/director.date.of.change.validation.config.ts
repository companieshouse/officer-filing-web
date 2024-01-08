import { DirectorDateOfChangeField } from "../model/date.model";
import { DateValidationType } from "../model/validation.model";
import { directorDateOfChangeErrorMessageKey } from "../utils/api.enumerations.keys";

// Configuration required for Director date of change error messages
export const DirectorDateOfChangeValidation: DateValidationType = {
    MissingValue: {
        Day: {
            messageKey: directorDateOfChangeErrorMessageKey.MISSING_DAY,
            source: [DirectorDateOfChangeField.DAY],
            link: DirectorDateOfChangeField.DAY
        },
        Month: {
            messageKey: directorDateOfChangeErrorMessageKey.MISSING_MONTH,
            source: [DirectorDateOfChangeField.MONTH],
            link: DirectorDateOfChangeField.MONTH
        },
        Year: {
            messageKey: directorDateOfChangeErrorMessageKey.MISSING_YEAR,
            source: [DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.YEAR
        },
        DayMonth: {
            messageKey: directorDateOfChangeErrorMessageKey.MISSING_DAY_MONTH,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.MONTH],
            link: DirectorDateOfChangeField.DAY
        },
        DayYear: {
            messageKey: directorDateOfChangeErrorMessageKey.MISSING_DAY_YEAR,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.DAY
        },
        MonthYear: {
            messageKey: directorDateOfChangeErrorMessageKey.MISSING_MONTH_YEAR,
            source: [DirectorDateOfChangeField.MONTH, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.MONTH
        },
        DayMonthYear: {
            messageKey: directorDateOfChangeErrorMessageKey.MISSING_DAY_MONTH_YEAR,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.MONTH, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.DAY
        },
        },
    InvalidValue: {
        Day: {
            messageKey: directorDateOfChangeErrorMessageKey.INVALID_DATE,
            source: [DirectorDateOfChangeField.DAY],
            link: DirectorDateOfChangeField.DAY
        },
        Month: {
            messageKey: directorDateOfChangeErrorMessageKey.INVALID_DATE,
            source: [DirectorDateOfChangeField.MONTH],
            link: DirectorDateOfChangeField.MONTH
        },
        Year: {
            messageKey: directorDateOfChangeErrorMessageKey.INVALID_DATE,
            source: [DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.YEAR
        },
        DayMonth: {
            messageKey: directorDateOfChangeErrorMessageKey.INVALID_DATE,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.MONTH],
            link: DirectorDateOfChangeField.DAY
        },
        DayYear: {
            messageKey: directorDateOfChangeErrorMessageKey.INVALID_DATE,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.DAY
        },
        MonthYear: {
            messageKey: directorDateOfChangeErrorMessageKey.INVALID_DATE,
            source: [DirectorDateOfChangeField.MONTH, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.MONTH
        },
        DayMonthYear: {
            messageKey: directorDateOfChangeErrorMessageKey.INVALID_DATE,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.MONTH, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.DAY
        },
    },
    RuleBased: {
        IncorporationDate: {
            messageKey: directorDateOfChangeErrorMessageKey.BEFORE_INCORPORATION_DATE,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.MONTH, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.DAY
        },
        DateOfChangeBeforeAppointment: {
            messageKey: directorDateOfChangeErrorMessageKey.DATE_OF_CHANGE_BEFORE_APPOINTMENT,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.MONTH, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.DAY
        },
        FutureDate: {
            messageKey: directorDateOfChangeErrorMessageKey.IN_FUTURE,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.MONTH, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.DAY
        },
        Before2009: {
            messageKey: directorDateOfChangeErrorMessageKey.BEFORE_2009,
            source: [DirectorDateOfChangeField.DAY, DirectorDateOfChangeField.MONTH, DirectorDateOfChangeField.YEAR],
            link: DirectorDateOfChangeField.DAY
        },
    }
}