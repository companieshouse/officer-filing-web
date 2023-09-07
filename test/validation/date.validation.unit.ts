import { RemovalDateErrorMessageKey } from '../../src/utils/api.enumerations.keys';
import { validateDate } from '../../src/validation/date.validation';
import { DateValidation} from "../../src/validation/remove.date.validation.config";


describe("Missing input validation tests", () => {
    test("Error if date field is completely empty", async () => {
        expect(validateDate("","","",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_DAY_MONTH_YEAR);
    });

    test("Error if day field is empty", async () => {
        expect(validateDate("","12","2021",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_DAY);
    });

    test("Error if month field is empty", async () => {
        expect(validateDate("12","","2021",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_MONTH);
    });
    
    test("Error if year field is empty", async () => {
        expect(validateDate("12","12","",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_YEAR);
    });

    test("Error if day and month field are empty", async () => {
        expect(validateDate("","","2021",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_DAY_MONTH);
    });

    test("Error if day and year field are empty", async () => {
        expect(validateDate("","12","",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_DAY_YEAR);
    });

    test("Don't error if day field is not empty", async () => {
        expect(validateDate("12","","",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_MONTH_YEAR);
    });

    test("Don't error with full input", async () => {
        expect(validateDate("12","11","2021",DateValidation)).toBeUndefined;
    });
});

describe("Invalid character day input validation tests", () => {
    test("Error if day field is invalid", async () => {
        expect(validateDate("1$","12","2021",DateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-day"]
        }));
    });

    test("Error if month field is invalid", async () => {
        expect(validateDate("1","12av","2021",DateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-month"]
        }));
    });

    test("Error if year field is invalid", async () => {
        expect(validateDate("12","12","year",DateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-year"]
        }));
    });

    test("Error if day and month fields are invalid", async () => {
        expect(validateDate(".*","pls","2021",DateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-day", "removal_date-month"]
        }));
    });

    test("Error if day and year fields are invalid", async () => {
        expect(validateDate("1$","12","2020b2020",DateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-day", "removal_date-year"]
        }));
    });
    
    test("Error if month and year fields are invalid", async () => {
        expect(validateDate("12","wer","wer",DateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-month", "removal_date-year"]
        }));
    });

    test("Error if day, month, and year fields are invalid", async () => {
        expect(validateDate("wer","wer","wer",DateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-day", "removal_date-month", "removal_date-year"]
        }));
    });

    test("Don't error when all fields are valid input", async () => {
        expect(validateDate("12","11","2021",DateValidation)).toBeUndefined;
    });
});

describe("Invalid date input validation tests", () => {
    test("Don't error if valid date", async () => {
        expect(validateDate("15","8","2013",DateValidation)).toBeUndefined;
        expect(validateDate("31","5","2013",DateValidation)).toBeUndefined;
    });

    test("Error if 29th February in non leap year", async () => {
        expect(validateDate("29","2","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
    });

    test("Don't error if 29th February in leap year", async () => {
        expect(validateDate("29","2","2012",DateValidation)?.messageKey).toReturn;
    });

    test("Error if non valid month", async () => {
        expect(validateDate("29","13","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("29","0","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
    });

    test("Error if non valid day", async () => {
        expect(validateDate("31","9","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("31","4","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("31","6","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("31","11","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","1","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","3","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","5","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","7","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","8","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","10","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","12","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("0","12","2013",DateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
    });
});

