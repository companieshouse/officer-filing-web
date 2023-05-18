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

export const officerLinks: OfficerLinks = {
  appointments: "appointments"
}

export const companyOfficerLinks: CompanyOfficerLinks = {
  officer: officerLinks
}

export const mockCompanyOfficer: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  dateOfBirth: dateOfBirth,
  links: companyOfficerLinks,
  name: "JOHN MiddleName DOE",
  officerRole: "DIRECTOR",
  resignedOn: "2022-12-04",
};

export const mockCorporateCompanyOfficer: CompanyOfficer = {
  address: mockAddress1,
  appointedOn: "2022-12-01",
  countryOfResidence: "UNITED KINGDOM",
  links: companyOfficerLinks,
  name: "JOHN MiddleName DOE",
  officerRole: "corporate-director",
  resignedOn: "2022-12-04",
};
