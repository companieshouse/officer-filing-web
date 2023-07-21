import { formatDateOfBirth, formatAppointmentDate, formatTitleCase, toUpperCase, retrieveDirectorNameFromAppointment, retrieveDirectorNameFromOfficer } from "../../src/utils/format";
import { DateOfBirth } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { validCompanyAppointment, companyAppointmentMissingMiddleName, companyAppointmentMissingName, companyAppointmentCorporateDirector } from "../mocks/company.appointment.mock";
import {mockCompanyOfficer, mockCompanyOfficerMissingMiddleName, mockCompanyOfficerMissingName, mockCorporateCompanyOfficer} from "../mocks/remove.director.check.answers.mock";

describe("formatTitleCase tests", () => {
  it("should return title case", () => {
    const formatted: string = formatTitleCase("example");
    const formattedCaps: string = formatTitleCase("CAPS");
    const formattedMulti: string = formatTitleCase("format multiple words");
    expect(formatted).toEqual("Example");
    expect(formattedCaps).toEqual("Caps");
    expect(formattedMulti).toEqual("Format Multiple Words");
  });

  it("should return empty string", () => {
    const empty: string = formatTitleCase("");
    const emptyUndefined: string = formatTitleCase(undefined);
    expect(empty).toEqual("");
    expect(emptyUndefined).toEqual("");
  });
});

describe("formatDateOfBirth tests", () => {
  it("should return date of birth in format Month YYYY", () => {
    const dateOfBirth: DateOfBirth = {
      month: "8",
      year: "1998"
    } as DateOfBirth;

    const dateOfBirthErr: DateOfBirth = {
      month: "0",
      year: "1998"
    } as DateOfBirth;
    const fomrattedDateOfBirth: string = formatDateOfBirth(dateOfBirth);
    const fomrattedDateOfBirthErr: string = formatDateOfBirth(dateOfBirthErr);

    expect(fomrattedDateOfBirth).toBe("August 1998");
    expect(fomrattedDateOfBirthErr).toBe("");
  });
});

describe("formatAppointmentDate tests", () => {
  it("should return appointment date in format DD? Month YYYY ", () => {
    const formattedAppointmentDate: string = formatAppointmentDate("1998-08-06");
    const formattedAppointmentDateErr: string = formatAppointmentDate("1998-00-06");

    expect(formattedAppointmentDate).toBe("6 August 1998");
    expect(formattedAppointmentDateErr).toBe("");
  });
});


describe("toUpperCase tests", () => {
  it("should convert to upper case", () => {
    const result: string = toUpperCase("this is a test");
    expect(result).toBe("THIS IS A TEST");
  });

  it("should convert to upper case with special chars", () => {
    const result: string = toUpperCase("thîs is á têst");
    expect(result).toBe("THÎS IS Á TÊST");
  });

  it("should return empty string if passed undefined", () => {
    const result: string = toUpperCase(undefined);
    expect(result).toBe("");
  });
});

describe("retrieveDirectorNameFromAppointments tests", () => {
  it("should return the appropriate value of the directors name", () => {

    const directorNameFull: string = retrieveDirectorNameFromAppointment(validCompanyAppointment);
    const directorName: string = retrieveDirectorNameFromAppointment(companyAppointmentMissingMiddleName);
    const directorNameCorporate: string = retrieveDirectorNameFromAppointment(companyAppointmentCorporateDirector);
    const missingDirectorName: string = retrieveDirectorNameFromAppointment(companyAppointmentMissingName);

    expect(directorNameFull).toBe("John Elizabeth Doe");
    expect(directorName).toBe("John Doe");
    expect(directorNameCorporate).toBe("REACTIONLIQUOR CESSPOOLLIQUOR REGRET");
    expect(missingDirectorName).toBe("");
  });
});

describe("retrieveDirectorNameFromOfficer tests", () => {
  it("should return the appropriate value of the directors name", () => {

    const directorNameFull: string = retrieveDirectorNameFromOfficer(mockCompanyOfficer);
    const directorName: string = retrieveDirectorNameFromOfficer(mockCompanyOfficerMissingMiddleName);
    const directorNameCorporate: string = retrieveDirectorNameFromOfficer(mockCorporateCompanyOfficer);
    const missingDirectorName: string = retrieveDirectorNameFromOfficer(mockCompanyOfficerMissingName);

    expect(directorNameFull).toBe("John Middlename Doe");
    expect(directorName).toBe("John Doe");
    expect(directorNameCorporate).toBe("Blue Enterprises");
    expect(missingDirectorName).toBe("");
  });
});
