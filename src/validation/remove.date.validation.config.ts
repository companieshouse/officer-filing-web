import { RemovalDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { DateValidationType } from "../model/validation.model";
import { RemovalDateField } from "../model/date.model";

// Configuration required for date validation error messages
export const DateValidation: DateValidationType = {
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
