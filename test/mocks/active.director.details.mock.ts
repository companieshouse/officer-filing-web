import { CompanyOfficer, Address, DateOfBirth, CompanyOfficerLinks, OfficerLinks, Identification } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const mockIdentification: Identification = {
  registrationNumber: "12345678"
};

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
  appointedOn: "2022-03-01",
  countryOfResidence: "UNITED KINGDOM",
  dateOfBirth: dateOfBirth,
  formerNames: undefined,
  identification: undefined,
  links: companyOfficerLinks,
  name: "JOHN MiddleName DOE",
  nationality: "British",
  occupation: "singer",
  officerRole: "DIRECTOR",
  resignedOn: "2023-01-04",
};

export const mockCompanyOfficers: CompanyOfficer[] = [
  {
    address: mockAddress1,
    appointedOn: "2022-03-01",
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
  },
  {
    address: mockAddress1,
    appointedOn: "2019-05-11",
    countryOfResidence: "UNITED KINGDOM",
    dateOfBirth: dateOfBirth,
    formerNames: undefined,
    identification: undefined,
    links: companyOfficerLinks,
    name: "JANE ALICE SMITH",
    nationality: "British",
    occupation: "designer",
    officerRole: "DIRECTOR",
    resignedOn: undefined,
  },
  {
    address: mockAddress1,
    appointedOn: "2020-11-03",
    countryOfResidence: "UNITED KINGDOM",
    dateOfBirth: dateOfBirth,
    formerNames: undefined,
    identification: mockIdentification,
    links: companyOfficerLinks,
    name: "BIG CORP",
    nationality: "British",
    occupation: "company",
    officerRole: "CORPORATE-DIRECTOR",
    resignedOn: undefined,
  },
  {
    address: mockAddress1,
    appointedOn: "2016-04-01",
    countryOfResidence: "UNITED KINGDOM",
    dateOfBirth: dateOfBirth,
    formerNames: undefined,
    identification: undefined,
    links: companyOfficerLinks,
    name: "BETTY WHITE",
    nationality: "British",
    occupation: "tester",
    officerRole: "NOMINEE-DIRECTOR",
    resignedOn: undefined,
  },
  {
    address: mockAddress1,
    appointedOn: "2022-08-13",
    countryOfResidence: "UNITED KINGDOM",
    dateOfBirth: dateOfBirth,
    formerNames: undefined,
    identification: mockIdentification,
    links: companyOfficerLinks,
    name: "BIGGER CORP 2",
    nationality: "British",
    occupation: "company",
    officerRole: "CORPORATE-NOMINEE-DIRECTOR",
    resignedOn: undefined,
  }
];

export const mockCompanyOfficersExtended: CompanyOfficer[] = [
  ...mockCompanyOfficers, ...mockCompanyOfficers
];