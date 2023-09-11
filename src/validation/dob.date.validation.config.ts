import { dobDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { DateValidationType } from "../model/validation.model";
import { DobDateField } from "../model/date.model";

// Configuration required for date validation error messages
export const DobDateValidation: DateValidationType = {
    MissingValue: {
        Day: {
            messageKey: dobDateErrorMessageKey.MISSING_DAY,
            source: [DobDateField.DAY],
            link: DobDateField.DAY
        },
        Month: {
            messageKey: dobDateErrorMessageKey.MISSING_MONTH,
            source: [DobDateField.MONTH],
            link: DobDateField.MONTH
        },
        Year: {
            messageKey: dobDateErrorMessageKey.MISSING_YEAR,
            source: [DobDateField.YEAR],
            link: DobDateField.YEAR
        },
        DayMonth: {
            messageKey: dobDateErrorMessageKey.MISSING_DAY_MONTH,
            source: [DobDateField.DAY, DobDateField.MONTH],
            link: DobDateField.DAY
        },
        DayYear: {
            messageKey: dobDateErrorMessageKey.MISSING_DAY_YEAR,
            source: [DobDateField.DAY, DobDateField.YEAR],
            link: DobDateField.DAY
        },
        MonthYear: {
            messageKey: dobDateErrorMessageKey.MISSING_MONTH_YEAR,
            source: [DobDateField.MONTH, DobDateField.YEAR],
            link: DobDateField.MONTH
        },
        DayMonthYear: {
            messageKey: dobDateErrorMessageKey.MISSING_DAY_MONTH_YEAR,
            source: [DobDateField.DAY, DobDateField.MONTH, DobDateField.YEAR],
            link: DobDateField.DAY
        },
    },
    InvalidValue: {
        Day: {
            messageKey: dobDateErrorMessageKey.INVALID_DATE,
            source: [DobDateField.DAY],
            link: DobDateField.DAY
        },
        Month: {
            messageKey: dobDateErrorMessageKey.INVALID_DATE,
            source: [DobDateField.MONTH],
            link: DobDateField.MONTH
        },
        Year: {
            messageKey: dobDateErrorMessageKey.INVALID_DATE,
            source: [DobDateField.YEAR],
            link: DobDateField.YEAR
        },
        DayMonth: {
            messageKey: dobDateErrorMessageKey.INVALID_DATE,
            source: [DobDateField.DAY, DobDateField.MONTH],
            link: DobDateField.DAY
        },
        DayYear: {
            messageKey: dobDateErrorMessageKey.INVALID_DATE,
            source: [DobDateField.DAY, DobDateField.YEAR],
            link: DobDateField.DAY
        },
        MonthYear: {
            messageKey: dobDateErrorMessageKey.INVALID_DATE,
            source: [DobDateField.MONTH, DobDateField.YEAR],
            link: DobDateField.MONTH
        },
        DayMonthYear: {
            messageKey: dobDateErrorMessageKey.INVALID_DATE,
            source: [DobDateField.DAY, DobDateField.MONTH, DobDateField.YEAR],
            link: DobDateField.DAY
        },
    }
}