import { COMPANY_LOOKUP, REMOVE_DIRECTOR_PATH } from "../types/page.urls";

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
export const WRONG_DETAILS_UPDATE_SECRETARY = "Update the secretary details";
export const WRONG_DETAILS_UPDATE_OFFICER = "Update the officer details";
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
export const COMPANY_NAME_PLACEHOLDER = "COMPANY_NAME_PLACEHOLDER";
export const TRANSACTION_ID_PLACEHOLDER = "TRANSACTION_ID_PLACEHOLDER";
export const APPOINTMENT_ID_PLACEHOLDER = "APPOINTMENT_ID_PLACEHOLDER";


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
  DIRECTOR = "DIRECTOR",
  CORPORATE_DIRECTOR = "CORPORATE-DIRECTOR",
  NOMINEE_DIRECTOR = "NOMINEE-DIRECTOR", 
  CORPORATE_NOMINEE_DIRECTOR = "CORPORATE-NOMINEE-DIRECTOR"
}

export enum STOP_TYPE {
  DISSOLVED = "dissolved",
  LIMITED_UNLIMITED = "limited-unlimited",
  NO_DIRECTORS = "no directors",
  PRE_OCTOBER_2009 = "pre-october-2009",
  ETAG = "etag"
}

export const allowedCompanyTypes = new Array(
  "private-unlimited", 
  "ltd", 
  "plc", 
  "private-limited-guarant-nsc-limited-exemption", 
  "private-limited-guarant-nsc", 
  "private-unlimited-nsc",
  "private-limited-shares-section-30-exemption");

export const STOP_PAGE_CONTENT = 
{
    dissolved:{
        pageHeader: "Company is dissolved or in the process of being dissolved",
        pageBody: `<p>` + COMPANY_NAME_PLACEHOLDER + ` cannot use this service because it has been dissolved, or it's in the process of being dissolved.</p>

        <p><a href="https://www.gov.uk/guidance/company-restoration-guide" data-event-id="read-the-company-restoration-guide-link">Read the Company Restoration Guide</a> to find out more about restoring a company name to the register.</p>
        <p>If this is the wrong company, <a href="/officer-filing-web" data-event-id="start-the-service-again-link">start the service again</a>.</p>
        <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">Contact us</a> if you have any questions.</p>
        `
    },
    limitedUnlimited:{
        pageHeader: "Only limited and unlimited companies can use this service",
        pageBody: `<p>You can only file director updates for ` + COMPANY_NAME_PLACEHOLDER + ` using this service if it's a:</p>
        <ul>
            <li>private limited company</li>
            <li>public limited company</li>
            <li>private unlimited company</li>
        </ul>  

        <p>To make an update for ` + COMPANY_NAME_PLACEHOLDER + `, you may find the form or service you need in the <a href="https://www.gov.uk/topic/company-registration-filing/forms" data-event-id="list-of-companies-house-forms">list of Companies House forms</a>.</p>
        <p>If this is the wrong company, <a href="` + COMPANY_LOOKUP.replace("{","%7B").replace("}","%7D") + `" data-event-id="enter-a-different-company-number-link">go back and enter a different company number</a>.</p>
        <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">Contact us</a> if you have any questions.</p>
        `
    },
    noDirectors:{
      pageHeader: "Company has no current directors",
      pageBody: `<p>` + COMPANY_NAME_PLACEHOLDER + ` cannot use this service because it has no current directors.</p>
      <p>If you want to appoint a director, you can use <a href="https://idam-ui.company-information.service.gov.uk/" data-event-id="webfiling-link">WebFiling</a> or a <a href="https://www.gov.uk/government/publications/appoint-a-director-ap01" data-event-id="paper-form-link">paper form</a>.</p>
      <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">Contact us</a> if you have any questions.</p>
      `
    },
    pre_october_2009:{
      pageHeader: "You cannot use this service",
      pageBody: `<p>The date the director was removed is before 1 October 2009.</p>
      <p>You'll need to file the <a href="https://webarchive.nationalarchives.gov.uk/ukgwa/20140103090023/http://www.companieshouse.gov.uk/forms/formsOnline1985.shtml" data-event-id="288b-form-link">288b form 'Terminating appointment as director or secretary'</a> on paper for directors removed before this date.</p>
      <p>If the date entered is not correct, you can <a href="` + REMOVE_DIRECTOR_PATH + `" data-event-id="enter-a-different-date-link">enter a different date</a>.</p>
      <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">Contact us</a> if you have any questions.</p>
      `
    },
    etag:{
      pageHeader: "Someone has already made updates for this director",
      pageBody: `<p>Since you started using this service, someone else has submitted an update to this director's details.</p>
      <p>If you still need to submit this update, you'll need to <a href="/officer-filing-web" data-event-id="start-the-service-again-link">start the service again</a>.</p>
      <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">Contact us</a> if you have any questions.</p>
      `
    },
}
