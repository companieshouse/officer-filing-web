import { checkDateFieldDay, checkDateFieldMonth, checkDateFieldYear } from '../../src/validation/date.validation';
import { ErrorMessages } from '../../src/validation/error.messages';


describe("Missing day input validation tests", () => {
    test("Error if date field is completely empty", async () => {
        expect(() =>  checkDateFieldDay("","","")).toThrowError(ErrorMessages.ENTER_DATE);
    });

    test("Error if day field is empty", async () => {
        expect(() =>  checkDateFieldDay("","12","2021")).toThrowError(ErrorMessages.DAY);
    });

    test("Error if day and month field are empty", async () => {
        expect(() =>  checkDateFieldDay("","","2021")).toThrowError(ErrorMessages.DAY);
    });

    test("Error if day and year field are empty", async () => {
        expect(() =>  checkDateFieldDay("","12","")).toThrowError(ErrorMessages.DAY);
    });

    test("Don't error if day field is not empty", async () => {
        expect(() =>  checkDateFieldDay("12","","")).toReturn;
    });

    test("Don't error with full input", async () => {
        expect(() =>  checkDateFieldDay("12","11","2021")).toReturn;
    });
});

describe("Missing month input validation tests", () => {
    test("Error if month and year field are empty", async () => {
        expect(() =>  checkDateFieldMonth("12","","")).toThrowError(ErrorMessages.MONTH);
    });

    test("Error if month field is empty", async () => {
        expect(() =>  checkDateFieldMonth("12","","2021")).toThrowError(ErrorMessages.MONTH);
    });

    test("Don't error if day field is empty, day errors are higher priority", async () => {
        expect(() =>  checkDateFieldMonth("","","")).toReturn;
        expect(() =>  checkDateFieldMonth("","","2021")).toReturn;
    });

    test("Don't error with full input", async () => {
        expect(() =>  checkDateFieldMonth("12","11","2021")).toReturn;
    });

});

describe("Missing year input validation tests", () => {
    test("Error if year field is empty", async () => {
        expect(() =>  checkDateFieldYear("12","12","")).toThrowError(ErrorMessages.YEAR);
    });

    test("Don't error if day field is empty, day errors are higher priority", async () => {
        expect(() =>  checkDateFieldYear("","","")).toReturn;
        expect(() =>  checkDateFieldYear("","5","")).toReturn;
    });

    test("Don't error if month field is empty, month errors are higher priority", async () => {
        expect(() =>  checkDateFieldYear("","","")).toReturn;
        expect(() =>  checkDateFieldYear("5","","")).toReturn;
    });

    test("Don't error with full input", async () => {
        expect(() =>  checkDateFieldYear("12","11","2021")).toReturn;
    });

});

describe("Invalid character day input validation tests", () => {
    test("Error if day field is invalid", async () => {
        expect(() =>  checkDateFieldDay("$","12","2021")).toThrowError(ErrorMessages.DAY_INVALID_CHARACTER);
    });

    test("Error if day is invalid and month field is invalid", async () => {
        expect(() =>  checkDateFieldDay("$","$","2021")).toThrowError(ErrorMessages.DAY_INVALID_CHARACTER);
    });

    test("Error if day is invalid and month field is invalid", async () => {
        expect(() =>  checkDateFieldDay("$","&","2021")).toThrowError(ErrorMessages.DAY_INVALID_CHARACTER);
    });

    test("Error if day is invalid and year field is invalid", async () => {
        expect(() =>  checkDateFieldDay("&d","12","$")).toThrowError(ErrorMessages.DAY_INVALID_CHARACTER);
    });

    test("Error if day is invalid and year field is ivalid", async () => {
        expect(() =>  checkDateFieldDay("&d","12","%s")).toThrowError(ErrorMessages.DAY_INVALID_CHARACTER);
    });

    test("Don't error if day field is valid but month and year are invalid", async () => {
        expect(() =>  checkDateFieldDay("12","$s","sh")).toReturn;
    });
});

describe("Invalid character month input validation tests", () => {
    test("Error if month and year field are invalid", async () => {
        expect(() =>  checkDateFieldMonth("12","^","ds")).toThrowError(ErrorMessages.MONTH_INVALID_CHARACTER);
    });

    test("Error if month field is invalid", async () => {
        expect(() =>  checkDateFieldMonth("12","&%","2021")).toThrowError(ErrorMessages.MONTH_INVALID_CHARACTER);
    });

    test("Don't error if day field is empty, day errors are higher priority", async () => {
        expect(() =>  checkDateFieldMonth("","$","")).toReturn;
        expect(() =>  checkDateFieldMonth("","^","*")).toReturn;
    });

    test("Don't error if day field is invalid, day errors are higher priority", async () => {
        expect(() =>  checkDateFieldMonth("&","$","")).toReturn;
        expect(() =>  checkDateFieldMonth("(","^","*")).toReturn;
    });
});

describe("Invalid charavter year input validation tests", () => {
    test("Error if year field is invalid", async () => {
        expect(() =>  checkDateFieldYear("12","12","&^")).toThrowError(ErrorMessages.YEAR_INVALID_CHARACTER);
    });

    test("Don't error if day field is empty, day errors are higher priority", async () => {
        expect(() =>  checkDateFieldYear("","","$^")).toReturn;
        expect(() =>  checkDateFieldYear("","5","*&")).toReturn;
    });

    test("Don't error if day field is invalid, day errors are higher priority", async () => {
        expect(() =>  checkDateFieldYear("ds","jk","$^")).toReturn;
        expect(() =>  checkDateFieldYear("fd","5","*&")).toReturn;
    });

    test("Don't error if month or day field is empty, month errors are higher priority", async () => {
        expect(() =>  checkDateFieldYear("","","$")).toReturn;
        expect(() =>  checkDateFieldYear("5","","$")).toReturn;
    });

    test("Don't error if month or day field is invalid, month errors are higher priority", async () => {
        expect(() =>  checkDateFieldYear("*","%^","$")).toReturn;
        expect(() =>  checkDateFieldYear("5","*","$")).toReturn;
    });
});

describe("Invalid date input validation tests", () => {
    test("Don't error if valid date", async () => {
        expect(() =>  checkDateFieldDay("15","8","2013")).toReturn;
        expect(() =>  checkDateFieldDay("31","5","2013")).toReturn;
    });

    test("Error if 29th February in non leap year", async () => {
        expect(() =>  checkDateFieldDay("29","2","2013")).toThrowError(ErrorMessages.INVALID_DATE);
    });

    test("Don't error if 29th February in leap year", async () => {
        expect(() =>  checkDateFieldDay("29","2","2012")).toReturn;
    });

    test("Error if non valid month", async () => {
        expect(() =>  checkDateFieldDay("29","13","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("29","0","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("29","-1","2013")).toThrowError(ErrorMessages.INVALID_DATE);
    });

    test("Error if non valid day", async () => {
        expect(() =>  checkDateFieldDay("31","9","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("31","4","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("31","6","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("31","11","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("32","1","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("32","3","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("32","5","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("32","7","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("32","8","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("32","10","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("32","12","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("0","12","2013")).toThrowError(ErrorMessages.INVALID_DATE);
        expect(() =>  checkDateFieldDay("-5","12","2013")).toThrowError(ErrorMessages.INVALID_DATE);
    });


});

