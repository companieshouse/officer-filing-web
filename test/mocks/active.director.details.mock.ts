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
  month: "12",
  year: "2001"
}

export const officerLinks: OfficerLinks = {
  appointments: "appointments"
}

export const companyOfficerLinks: CompanyOfficerLinks = {
  officer: officerLinks
}

export const mockCompanyOfficer: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "01-03-2022",
  countryOfResidence: "UNITED KINGDOM",
  dateOfBirth: dateOfBirth,
  formerNames: undefined,
  identification: undefined,
  links: companyOfficerLinks,
  name: "JOHN MiddleName DOE",
  nationality: "British",
  occupation: "singer",
  officerRole: "DIRECTOR",
  resignedOn: "04-01-2023",
};
