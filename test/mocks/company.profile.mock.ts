jest.mock("../../src/services/company.profile.service");

import { Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const validCompanyProfile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodEndOn: "2019-10-10",
      periodStartOn: "2019-01-01",
    },
    nextDue: "2020-05-31",
    overdue: false,
  },
  companyName: "Test Company",
  companyNumber: "12345678",
  companyStatus: "active",
  companyStatusDetail: "company status detail",
  confirmationStatement: {
    lastMadeUpTo: "2019-04-30",
    nextDue: "2020-04-30",
    nextMadeUpTo: "2020-03-15",
    overdue: false,
  },
  dateOfCreation: "1972-06-22",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {},
  registeredOfficeAddress: {
    addressLineOne: "Line1",
    addressLineTwo: "Line2",
    careOf: "careOf",
    country: "uk",
    locality: "locality",
    poBox: "123",
    postalCode: "POST CODE",
    premises: "premises",
    region: "region",
  },
  sicCodes: ["123"],
  type: "ltd",
};

export const validAddress = {
  addressLine1: "Line1",
  addressLine2: "Line2",
  country: "England",
  locality: "locality",
  poBox: "123",
  postalCode: "UB7 0GB",
  premises: "premises",
};

export const validCompanyEstablishedAfter2009Profile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodEndOn: "2019-10-10",
      periodStartOn: "2019-01-01",
    },
    nextDue: "2020-05-31",
    overdue: false,
  },
  companyName: "Test Company",
  companyNumber: "12345678",
  companyStatus: "active",
  companyStatusDetail: "company status detail",
  confirmationStatement: {
    lastMadeUpTo: "2019-04-30",
    nextDue: "2020-04-30",
    nextMadeUpTo: "2020-03-15",
    overdue: false,
  },
  dateOfCreation: "2010-06-22",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {},
  registeredOfficeAddress: {
    addressLineOne: "Line1",
    addressLineTwo: "Line2",
    careOf: "careOf",
    country: "uk",
    locality: "locality",
    poBox: "123",
    postalCode: "POST CODE",
    premises: "premises",
    region: "region",
  },
  sicCodes: ["123"],
  type: "ltd",
};

export const validPublicCompanyProfile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodEndOn: "2019-10-10",
      periodStartOn: "2019-01-01",
    },
    nextDue: "2020-05-31",
    overdue: false,
  },
  companyName: "Test Company",
  companyNumber: "12345678",
  companyStatus: "active",
  companyStatusDetail: "company status detail",
  confirmationStatement: {
    lastMadeUpTo: "2019-04-30",
    nextDue: "2020-04-30",
    nextMadeUpTo: "2020-03-15",
    overdue: false,
  },
  dateOfCreation: "1972-06-22",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {},
  registeredOfficeAddress: {
    addressLineOne: "Line1",
    addressLineTwo: "Line2",
    careOf: "careOf",
    country: "uk",
    locality: "locality",
    poBox: "123",
    postalCode: "POST CODE",
    premises: "premises",
    region: "region",
  },
  sicCodes: ["123"],
  type: "plc",
};

 export const dissolvedCompanyProfile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodEndOn: "2019-10-10",
      periodStartOn: "2019-01-01",
    },
    nextDue: "2020-05-31",
    overdue: false,
  },
  companyName: "Dissolved Test Company",
  companyNumber: "12345678",
  companyStatus: "dissolved",
  companyStatusDetail: "company status detail",
  confirmationStatement: {
    lastMadeUpTo: "2019-04-30",
    nextDue: "2020-04-30",
    nextMadeUpTo: "2020-03-15",
    overdue: false,
  },
  dateOfCreation: "1972-06-22",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {},
  registeredOfficeAddress: {
    addressLineOne: "Line1",
    addressLineTwo: "Line2",
    careOf: "careOf",
    country: "uk",
    locality: "locality",
    poBox: "123",
    postalCode: "POST CODE",
    premises: "premises",
    region: "region",
  },
  sicCodes: ["123"],
  type: "limited",
};

export const dissolvedMissingNameCompanyProfile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodEndOn: "2019-10-10",
      periodStartOn: "2019-01-01",
    },
    nextDue: "2020-05-31",
    overdue: false,
  },
  companyName: "",
  companyNumber: "12345678",
  companyStatus: "dissolved",
  companyStatusDetail: "company status detail",
  confirmationStatement: {
    lastMadeUpTo: "2019-04-30",
    nextDue: "2020-04-30",
    nextMadeUpTo: "2020-03-15",
    overdue: false,
  },
  dateOfCreation: "1972-06-22",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {},
  registeredOfficeAddress: {
    addressLineOne: "Line1",
    addressLineTwo: "Line2",
    careOf: "careOf",
    country: "uk",
    locality: "locality",
    poBox: "123",
    postalCode: "POST CODE",
    premises: "premises",
    region: "region",
  },
  sicCodes: ["123"],
  type: "limited",
};

 export const overseaCompanyCompanyProfile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodEndOn: "2019-10-10",
      periodStartOn: "2019-01-01",
    },
    nextDue: "2020-05-31",
    overdue: false,
  },
  companyName: "Test Company",
  companyNumber: "12345678",
  companyStatus: "dissolved",
  companyStatusDetail: "company status detail",
  confirmationStatement: {
    lastMadeUpTo: "2019-04-30",
    nextDue: "2020-04-30",
    nextMadeUpTo: "2020-03-15",
    overdue: false,
  },
  dateOfCreation: "1972-06-22",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {},
  registeredOfficeAddress: {
    addressLineOne: "Line1",
    addressLineTwo: "Line2",
    careOf: "careOf",
    country: "uk",
    locality: "locality",
    poBox: "123",
    postalCode: "POST CODE",
    premises: "premises",
    region: "region",
  },
  sicCodes: ["123"],
  type: "oversea-company",
};

export const overseaCompanyMissingNameCompanyProfile: CompanyProfile = {
  accounts: {
    nextAccounts: {
      periodEndOn: "2019-10-10",
      periodStartOn: "2019-01-01",
    },
    nextDue: "2020-05-31",
    overdue: false,
  },
  companyName: "",
  companyNumber: "12345678",
  companyStatus: "active",
  companyStatusDetail: "company status detail",
  confirmationStatement: {
    lastMadeUpTo: "2019-04-30",
    nextDue: "2020-04-30",
    nextMadeUpTo: "2020-03-15",
    overdue: false,
  },
  dateOfCreation: "1972-06-22",
  hasBeenLiquidated: false,
  hasCharges: false,
  hasInsolvencyHistory: false,
  jurisdiction: "england-wales",
  links: {},
  registeredOfficeAddress: {
    addressLineOne: "Line1",
    addressLineTwo: "Line2",
    careOf: "careOf",
    country: "uk",
    locality: "locality",
    poBox: "123",
    postalCode: "POST CODE",
    premises: "premises",
    region: "region",
  },
  sicCodes: ["123"],
  type: "oversea-company",
};

export const validSDKResource: Resource<CompanyProfile> = {
  httpStatusCode: 200,
  resource: validCompanyProfile,
};
