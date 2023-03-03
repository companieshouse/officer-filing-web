export const STATEMENT_OF_CAPITAL_ERROR = "Select yes if the statement of capital is correct";
export const TRADING_STATUS_ERROR = "Select yes if the company trading status is correct";
export const SIC_CODE_ERROR = "Select yes if the SIC codes are correct";
export const DESCRIPTION = "Officer Filing Transaction";
export const REFERENCE = "OfficerFilingReference";
export const PEOPLE_WITH_SIGNIFICANT_CONTROL_ERROR = "Select yes if the PSC details are correct";
export const PSC_STATEMENT_CONTROL_ERROR = "Select yes if the company PSC Statement is correct";
export const REGISTER_LOCATIONS_ERROR = "Please select yes if the Company records location is correct";
export const REGISTERED_OFFICE_ADDRESS_ERROR = "Select yes if the Registered Office Address is correct";
export const DIRECTOR_DETAILS_ERROR = "Select yes if director details are correct";
export const OFFICER_DETAILS_ERROR = "Select yes if officer details are correct";
export const SHAREHOLDERS_ERROR = "Select yes if the active shareholders are correct";
export const PSC_STATEMENT_NOT_FOUND = "No additional statements relating to PSCs are currently held on the public register.";
export const WRONG_DETAILS_UPDATE_PSC = "Update the people with significant control (PSC) details";
export const WRONG_DETAILS_INCORRECT_PSC = "Incorrect people with significant control - File a confirmation statement";
export const WRONG_DETAILS_UPDATE_SECRETARY = "Update the secretary details";
export const WRONG_DETAILS_UPDATE_OFFICER = "Update the officer details";
export const WRONG_DETAILS_UPDATE_OFFICERS = "Update officers - File a confirmation statement";
export const PSC_STATEMENT_NAME_PLACEHOLDER = "{linked_psc_name}";
export const LOCALE_EN = "en";
export const DETAIL_TYPE_OFFICER = "officer";
export const DETAIL_TYPE_PSC = "people with significant control (PSC)";
export const DETAIL_TYPE_PSC_LEGEND = "PSC";
export const WRONG_REGISTER_ERROR = "Select yes if you have updated where the company records are kept";
export const WRONG_ROA_ERROR = "Select yes if you have updated the registered office address";
export const WRONG_OFFICER_ERROR = "Select yes if you have updated the officer details";
export const WRONG_PSC_ERROR = "Select yes if you have updated the PSC details";
export const SIGNOUT_RETURN_URL_SESSION_KEY = 'signout-return-to-url';
export const WRONG_PSC_DETAILS_TEXT = "wrong-psc-details";
export const WRONG_PSC_STATEMENT_TEXT = "wrong-psc-statement";


export enum RADIO_BUTTON_VALUE {
  NO = "no",
  YES = "yes",
  RECENTLY_FILED = "recently_filed"
}

export const taskKeys = {
  SECTION_STATUS_KEY: "sectionStatus"
};

export const appointmentTypes = {
  INDIVIDUAL_PSC: "5007",
  RLE_PSC: "5008",
  LEGAL_PERSON_PSC: "5009"
};

export const appointmentTypeNames = {
  PSC: "psc",
  RLE: "rle",
  ORP: "orp"
};

export enum SECTIONS {
  ACTIVE_OFFICER = "activeOfficerDetailsData",
  PSC = "personsSignificantControlData",
  ROA = "registeredOfficeAddressData",
  REGISTER_LOCATIONS = "registerLocationsData",
  SIC = "sicCodeData",
  SOC = "statementOfCapitalData",
  SHAREHOLDER = "shareholderData",
  TRADING_STATUS = "tradingStatusData"
}

export const transactionStatuses = {
  CLOSED: "closed"
};

export const headers = {
  PAYMENT_REQUIRED: "x-payment-required"
};

export const links = {
  COSTS: "costs"
};

export enum OFFICER_ROLE {
  SECRETARY = "SECRETARY",
  DIRECTOR = "DIRECTOR"
}
