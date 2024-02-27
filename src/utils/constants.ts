import { COMPANY_LOOKUP, DATE_DIRECTOR_REMOVED_PATH } from "../types/page.urls";

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
export const CONSENT_TO_ACT_AS_DIRECTOR = "Select if you confirm that by submitting this information, the person named has consented to act as director";
export const HA_TO_SA_ERROR = "Select yes if the correspondence address changes in the future and you want this to apply to the home address";
export const ETAG_PAGE_HEADER = "ETAG_PAGE_HEADER";
export const ETAG_PAGE_BODY_1 = "ETAG_PAGE_BODY_1";
export const ETAG_PAGE_BODY_2 = "ETAG_PAGE_BODY_2";
export const ETAG_PAGE_BODY_START_SERVICE_AGAIN_LINK = "ETAG_PAGE_BODY_START_SERVICE_AGAIN_LINK";
export const STOP_PAGE_BODY_CONTACT_US_LINK = "STOP_PAGE_CONTACT_US_LINK";
export const STOP_PAGE_CONTACT_US_TEXT = "STOP_PAGE_CONTACT_US_TEXT";
export const PRE_OCTOBER_2009_HEADER = "PRE_OCTOBER_2009_HEADER";
export const PRE_OCTOBER_2009_HEADER1 = "PRE_OCTOBER_2009_HEADER1";
export const PRE_OCTOBER_2009_288B_LINK_TEXT1 = "PRE_OCTOBER_2009_288B_LINK_TEXT1";
export const PRE_OCTOBER_2009_288B_LINK_TEXT2 = "PRE_OCTOBER_2009_288B_LINK_TEXT2";
export const PRE_OCTOBER_2009_288B_PARAGRAPH_TEXT = "PRE_OCTOBER_2009_288B_PARAGRAPH_TEXT";
export const PRE_OCTOBER_2009_REMOVED_DATE_TEXT1 = "PRE_OCTOBER_2009_REMOVED_DATE_TEXT1";
export const PRE_OCTOBER_2009_REMOVED_DATE_TEXT2 = "PRE_OCTOBER_2009_REMOVED_DATE_TEXT2";
export const PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT1 = "PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT1";
export const PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT2 = "PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT2";
export const DATE_DIRECTOR_REMOVED_LINK = "DATE_DIRECTOR_REMOVED_LINK";

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
  PRE_OCTOBER_2009 = "pre-october-2009",
  ETAG = "etag",
  SOMETHING_WENT_WRONG = "something-went-wrong"
}

export enum FILING_DESCRIPTION {
  REMOVE_DIRECTOR = "Remove a company director",
  APPOINT_DIRECTOR = "Appoint a company director",
  UPDATE_DIRECTOR = "Update a company director"
}

export const allowedPublicCompanyTypes = new Array("plc");

export const allowedPrivateCompanyTypes = new Array("ltd", "private-limited-guarant-nsc-limited-exemption", "private-limited-guarant-nsc", "private-unlimited", "private-unlimited-nsc", "private-limited-shares-section-30-exemption");

export const allowedCompanyTypes = allowedPublicCompanyTypes.concat(allowedPrivateCompanyTypes);

export const STOP_PAGE_CONTENT = 
{
    dissolved:{
        pageHeader: "Company is dissolved or in the process of being dissolved",
        pageBody: `<p>` + COMPANY_NAME_PLACEHOLDER + ` cannot use this service because it has been dissolved, or it's in the process of being dissolved.</p>

        <p><a href="https://www.gov.uk/guidance/company-restoration-guide" data-event-id="read-the-company-restoration-guide-link">Read the Company Restoration Guide</a> to find out more about restoring a company name to the register.</p>
        <p>If this is the wrong company, <a href="/appoint-update-remove-company-officer" data-event-id="start-the-service-again-link">start the service again</a>.</p>
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
    pre_october_2009:{
      pageHeader: PRE_OCTOBER_2009_HEADER,
      pageBody: `<p>` + PRE_OCTOBER_2009_HEADER1 + `</p>
      <p>` + PRE_OCTOBER_2009_288B_LINK_TEXT1 + `<a href="https://webarchive.nationalarchives.gov.uk/ukgwa/20140103090023/http://www.companieshouse.gov.uk/forms/formsOnline1985.shtml" data-event-id="288b-form-link">` + PRE_OCTOBER_2009_288B_LINK_TEXT2 + `</a>` + PRE_OCTOBER_2009_288B_PARAGRAPH_TEXT + `</p>
      <p>` + PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT1 + " enquiries@companieshouse.gov.uk " + PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT2 + `</p>
      <p>` + PRE_OCTOBER_2009_REMOVED_DATE_TEXT1+ `<a href="` + DATE_DIRECTOR_REMOVED_LINK + `" data-event-id="enter-a-different-date-link">` + PRE_OCTOBER_2009_REMOVED_DATE_TEXT2 + `</a>.</p>
      <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">` + STOP_PAGE_BODY_CONTACT_US_LINK + `</a>` + STOP_PAGE_CONTACT_US_TEXT + `</p>
      `
    },
    etag:{
      pageHeader: ETAG_PAGE_HEADER,
      pageBody: `<p>` + ETAG_PAGE_BODY_1 + `</p>
      <p>` + ETAG_PAGE_BODY_2 + `<a href="/appoint-update-remove-company-officer" data-event-id="start-the-service-again-link">` + ETAG_PAGE_BODY_START_SERVICE_AGAIN_LINK + `</a>.</p>
      <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">` + STOP_PAGE_BODY_CONTACT_US_LINK + `</a>` + STOP_PAGE_CONTACT_US_TEXT + `</p>
      `
    },
    somethingWentWrong:{
      pageHeader: "Something went wrong",
      pageBody: `
      <p>You need to <a href="/appoint-update-remove-company-officer" data-event-id="start-the-service-again-link">start the service again</a>.</p>
      `
    }
}
