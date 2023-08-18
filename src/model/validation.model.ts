export type ValidationError = {
    messageKey: string,
    source: string[],
    link: string
}

export type FormattedValidationErrors = {
    [key: string]: {
        text: string;
    },
} & {
    errorList: {
        href: string,
        text: string,
    }[],
};

export interface DateValidationType {
    MissingValue: {
        Day: ValidationError,
        Month: ValidationError,
        Year: ValidationError,
        DayMonth: ValidationError,
        DayYear: ValidationError,
        MonthYear: ValidationError,
        DayMonthYear: ValidationError,
    },
    InvalidValue: {
        Day: ValidationError,
        Month: ValidationError,
        Year: ValidationError,
        DayMonth: ValidationError,
        DayYear: ValidationError,
        MonthYear: ValidationError,
        DayMonthYear: ValidationError,
    }
}