import {
  formatDateOfBirth,
  formatAppointmentDate,
  formatTitleCase,
  toUpperCase,
  retrieveDirectorNameFromAppointment,
  retrieveDirectorNameFromOfficer,
  formatNationalitiesToSentenceCase,
  formatAddress
} from "../../src/utils/format";
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

describe("formatAddress tests", () => {
    it ("should return address without undefined and empty string in correct format", () => {
      const address = ["123 New St", undefined, "", "AA11 1AZ"];
      const formattedAddress: string = formatAddress(address);
      expect(formattedAddress).toBe("123 New St, AA11 1AZ")
    });

    it ("should return address without undefined in correct format", () => {
      const address = ["123 New St", undefined, "AA11 1AZ"];
      const formattedAddress = formatAddress(address);
      expect(formattedAddress).toBe("123 New St, AA11 1AZ")
    });

    it ("should return address without empty string in correct format", () => {
      const address = ["123 New St", "", "AA11 1AZ"];
      const formattedAddress: string = formatAddress(address);
      expect(formattedAddress).toBe("123 New St, AA11 1AZ")
    });

    it ("should return address without leading or trailing white spaces in correct format", () => {
      const address = ["123 New St  ", "", "  AA11 1AZ"];
      const formattedAddress: string = formatAddress(address);
      expect(formattedAddress).toBe("123 New St, AA11 1AZ")
    });
  })


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

describe("formatNationalitiesToSentenceCase", () => {
  test.each([
    [undefined, ""],
    ["FRANCE", "France"],
    ["BOSNIA AND HERZEGOVINA", "Bosnia and Herzegovina"],
    ["ISLE OF MAN", "Isle of Man"],
    ["SAINT VINCENT AND THE GRENADINES", "Saint Vincent and the Grenadines"],
    ["BRITISH INDIAN OCEAN TERRITORY", "British Indian Ocean Territory"],
    ["SAINT HELENA, ASCENSION AND TRISTAN DA CUNHA", "Saint Helena, Ascension and Tristan da Cunha"],
    ["SINT MAARTEN (DUTCH PART)", "Sint Maarten (Dutch part)"],
    ["Congolese (Drc)", "Congolese (DRC)"],
    ["HEARD ISLAND AND MCDONALD ISLANDS","Heard Island and McDonald Islands"],
    ["GUINEA-BISSAU", "Guinea-Bissau"],
    ["Svalbard And Jan Mayen", "Svalbard and Jan Mayen"],
    ["Saint Helena, Ascension And Tristan Da Cunha", "Saint Helena, Ascension and Tristan da Cunha"],
    ["Isle Of Mann", "Isle of Mann"],
    ["Sint Maarten (Dutch Part)", "Sint Maarten (Dutch part)"],
    ["Congo, The Democratic Republic Of The", "Congo, the Democratic Republic of the"],
    ["Saint Vincent And The Grenadines", "Saint Vincent and the Grenadines"],
    ["South Georgia And The South Sandwich Islands", "South Georgia and the South Sandwich Islands"],
    ["Heard Island And Mcdonald Islands", "Heard Island and McDonald Islands"],
  ])(`Correctly reformats %s`, (str, expectedResult) => {
    expect(formatNationalitiesToSentenceCase(str)).toEqual(expectedResult);
  });
});
