import { CompanyOfficer, Address, DateOfBirth, CompanyOfficerLinks, OfficerLinks } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const mockAddress1: Address = {
  addressLine1: "Diddly squat farm shop",
  addressLine2: "",
  careOf: undefined,
  country: "England",
  locality: "Chadlington",
  poBox: undefined,
  postalCode: "OX7 3PE",
  premises: undefined,
  region: "Thisshire"
};

export const dateOfBirth: DateOfBirth = {
  day: "5",
  month: "11",
  year: "2002"
}

export const dateOfBirthMissingDay: DateOfBirth = {
  month: "11",
  year: "2002"
}

export const officerLinks: OfficerLinks = {
  appointments: "appointments"
}

export const companyOfficerLinks: CompanyOfficerLinks = {
  self: "company/00006400/appointments/9876",
  officer: officerLinks
}

export const mockCompanyOfficer: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  dateOfBirth: dateOfBirth,
  links: companyOfficerLinks,
  name: "Doe, John Middlename",
  title: "Mr",
  forename: "John",
  surname: "Doe",
  otherForenames: "Middlename",
  officerRole: "DIRECTOR",
  resignedOn: "2022-12-04",
};

export const mockCompanyOfficerMissingDateOfBirth: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  links: companyOfficerLinks,
  name: "JOHN MiddleName DOE",
  officerRole: "DIRECTOR",
  resignedOn: "2022-12-04",
};

export const mockCompanyOfficerMissingDateOfBirthDay: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  dateOfBirth: dateOfBirthMissingDay,
  links: companyOfficerLinks,
  name: "JOHN MiddleName DOE",
  officerRole: "DIRECTOR",
  resignedOn: "2022-12-04",
};

export const mockCompanyOfficerMissingResignedOn: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  dateOfBirth: dateOfBirth,
  links: companyOfficerLinks,
  name: "JOHN MiddleName DOE",
  officerRole: "DIRECTOR"
};

export const mockCompanyOfficerMissingMiddleName: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  dateOfBirth: dateOfBirth,
  links: companyOfficerLinks,
  name: "JOHN Middlename DOE",
  forename: "John",
  surname: "Doe",
  officerRole: "DIRECTOR",
  resignedOn: "2022-12-04",
};

export const mockCompanyOfficerMissingName: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  dateOfBirth: dateOfBirth,
  links: companyOfficerLinks,
  name: "",
  officerRole: "DIRECTOR",
  resignedOn: "2022-12-04",
};

export const mockCorporateCompanyOfficer: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  links: companyOfficerLinks,
  name: "Blue Enterprises",
  officerRole: "corporate-director",
  resignedOn: "2022-12-04",
};

export const mockCorporateNomineeCompanyOfficer: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  links: companyOfficerLinks,
  name: "Blue Enterprises",
  officerRole: "corporate-nominee-director",
  resignedOn: "2022-12-04",
};
