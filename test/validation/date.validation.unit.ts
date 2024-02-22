import { RemovalDateErrorMessageKey, appointmentDateErrorMessageKey } from '../../src/utils/api.enumerations.keys';
import { validateDate , validateDateOfAppointment } from '../../src/validation/date.validation';
import { RemovalDateValidation} from "../../src/validation/remove.date.validation.config";
import { AppointmentDateValidation} from "../../src/validation/appointment.date.validation.config";
import { validCompanyProfile } from "../mocks/company.profile.mock";


describe("Missing input validation tests", () => {
    test("Error if date field is completely empty", async () => {
        expect(validateDate("","","",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_DAY_MONTH_YEAR);
    });

    test("Error if day field is empty", async () => {
        expect(validateDate("","12","2021",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_DAY);
    });

    test("Error if month field is empty", async () => {
        expect(validateDate("12","","2021",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_MONTH);
    });
    
    test("Error if year field is empty", async () => {
        expect(validateDate("12","12","",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_YEAR);
    });

    test("Error if day and month field are empty", async () => {
        expect(validateDate("","","2021",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_DAY_MONTH);
    });

    test("Error if day and year field are empty", async () => {
        expect(validateDate("","12","",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_DAY_YEAR);
    });

    test("Don't error if day field is not empty", async () => {
        expect(validateDate("12","","",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.MISSING_MONTH_YEAR);
    });

    test("Don't error with full input", async () => {
        expect(validateDate("12","11","2021",RemovalDateValidation)).toBeUndefined;
    });
});

describe("Invalid character day input validation tests", () => {
    test("Error if day field is invalid", async () => {
        expect(validateDate("1$","12","2021",RemovalDateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-day"]
        }));
    });

    test("Error if month field is invalid", async () => {
        expect(validateDate("1","12av","2021",RemovalDateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-month"]
        }));
    });

    test("Error if year field is invalid", async () => {
        expect(validateDate("12","12","year",RemovalDateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-year"]
        }));
    });

    test("Error if day and month fields are invalid", async () => {
        expect(validateDate(".*","pls","2021",RemovalDateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-day", "removal_date-month"]
        }));
    });

    test("Error if day and year fields are invalid", async () => {
        expect(validateDate("1$","12","2020b2020",RemovalDateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-day", "removal_date-year"]
        }));
    });
    
    test("Error if month and year fields are invalid", async () => {
        expect(validateDate("12","wer","wer",RemovalDateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-month", "removal_date-year"]
        }));
    });

    test("Error if day, month, and year fields are invalid", async () => {
        expect(validateDate("wer","wer","wer",RemovalDateValidation)).toEqual(expect.objectContaining({
            messageKey: RemovalDateErrorMessageKey.INVALID_DATE,
            source: ["removal_date-day", "removal_date-month", "removal_date-year"]
        }));
    });

    test("Don't error when all fields are valid input", async () => {
        expect(validateDate("12","11","2021",RemovalDateValidation)).toBeUndefined;
    });
});

describe("Invalid date input validation tests", () => {
    test("Don't error if valid date", async () => {
        expect(validateDate("15","8","2013",RemovalDateValidation)).toBeUndefined;
        expect(validateDate("31","5","2013",RemovalDateValidation)).toBeUndefined;
    });

    test("Error if 29th February in non leap year", async () => {
        expect(validateDate("29","2","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
    });

    test("Don't error if 29th February in leap year", async () => {
        expect(validateDate("29","2","2012",RemovalDateValidation)?.messageKey).toReturn;
    });

    test("Error if non valid month", async () => {
        expect(validateDate("29","13","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("29","0","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
    });

    test("Error if non valid day", async () => {
        expect(validateDate("31","9","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("31","4","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("31","6","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("31","11","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","1","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","3","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","5","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","7","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","8","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","10","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("32","12","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
        expect(validateDate("0","12","2013",RemovalDateValidation)?.messageKey).toEqual(RemovalDateErrorMessageKey.INVALID_DATE);
    });


    test("Error if appointmnet date is less than 16 years after DOB", async () => {
        const dateOfBirth = new Date("2000", "01", "21");
        expect(validateDateOfAppointment("01","01","2016",AppointmentDateValidation,dateOfBirth,validCompanyProfile)?.messageKey).toEqual(appointmentDateErrorMessageKey.APPOINTMENT_DATE_UNDERAGE);
    });

    test("Don't error if appointmnet date is more than 16 years after DOB", async () => {
        const dateOfBirth = new Date("2000", "01", "01");
        expect(validateDateOfAppointment("01","01","2023",AppointmentDateValidation,dateOfBirth,validCompanyProfile)?.messageKey).toReturn;
    });

});

