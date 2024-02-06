import { ACCOUNT_URL } from "../utils/properties";
import { Templates } from "./template.paths";

export enum urlParams {
  PARAM_COMPANY_NUMBER = "companyNumber",
  PARAM_TRANSACTION_ID = "transactionId",
  PARAM_SUBMISSION_ID = "submissionId",
  PARAM_APPOINTMENT_ID = "appointmentId",
  PARAM_BACK_LINK = "backLink"
}

export enum URL_QUERY_PARAM {
  COMPANY_NUM = "companyNumber",
  PARAM_TRANSACTION_ID = "transactionId",
  PARAM_SUBMISSION_ID = "submissionId",
  PARAM_APPOINTMENT_ID = "appointmentId",
  PARAM_STOP_TYPE = "stopType",
  IS_PSC = "isPsc",
  LANG = "lang"
}

const SEPARATOR = "/";

export const CONTAINS_TRANSACTION_ID = `/transaction/:${urlParams.PARAM_TRANSACTION_ID}`;
export const CONTAINS_SUBMISSION_ID = `/submission/:${urlParams.PARAM_SUBMISSION_ID}`;
export const CONTAINS_APPOINTMENT_ID = `/appointment/:${urlParams.PARAM_APPOINTMENT_ID}`;

export const COMPANY_AUTH_PROTECTED_BASE = `/company/:${urlParams.PARAM_COMPANY_NUMBER}`;
export const ACTIVE_BASE = COMPANY_AUTH_PROTECTED_BASE + CONTAINS_TRANSACTION_ID;
export const ACTIVE_SUBMISSION_BASE = ACTIVE_BASE + CONTAINS_SUBMISSION_ID;

// Use _PATH consts for redirects
// Use const without _PATH to match the url in the routes.ts
export const ACCESSIBILITY_STATEMENT = SEPARATOR + Templates.ACCESSIBILITY_STATEMENT;
export const ACCOUNTS_SIGNOUT_PATH = `${ACCOUNT_URL}/signout`;
export const CONFIRM_COMPANY = SEPARATOR + Templates.CONFIRM_COMPANY;
export const OFFICER_FILING = "/appoint-update-remove-company-officer";
export const COMPANY_NUMBER = "/company-number";
export const DIRECTOR_ID = "/director-id";
export const COMPANY_LOOKUP = "/company-lookup/search?forward="+OFFICER_FILING+"/confirm-company?companyNumber={companyNumber}";
export const COMPANY_LOOKUP_WITH_LANG = "/company-lookup/search?forward=%2Fappoint-update-remove-company-officer%2Fconfirm-company%3FcompanyNumber%3D%7BcompanyNumber%7D%26lang%3D";
export const ACCESSIBILITY_STATEMENT_PATH = OFFICER_FILING + ACCESSIBILITY_STATEMENT;
export const CONFIRM_COMPANY_PATH = OFFICER_FILING + CONFIRM_COMPANY;
export const SIGNOUT_PATH = "/signout";
export const CREATE_TRANSACTION = COMPANY_AUTH_PROTECTED_BASE + "/transaction";
export const CREATE_TRANSACTION_PATH = OFFICER_FILING + CREATE_TRANSACTION;
export const TRADING_STATUS = ACTIVE_SUBMISSION_BASE + "/trading-status";
export const TRADING_STATUS_PATH = OFFICER_FILING + TRADING_STATUS ;
export const ACTIVE_OFFICERS_PATH_END =  "/active-officers";
export const ACTIVE_OFFICERS = ACTIVE_SUBMISSION_BASE + ACTIVE_OFFICERS_PATH_END;
export const ACTIVE_OFFICERS_PATH = OFFICER_FILING + ACTIVE_OFFICERS;
export const ACTIVE_OFFICERS_DETAILS = ACTIVE_SUBMISSION_BASE + "/active-officers-details";
export const ACTIVE_OFFICERS_DETAILS_PATH = OFFICER_FILING + ACTIVE_OFFICERS_DETAILS;
export const CURRENT_DIRECTORS = ACTIVE_BASE + "/current-directors";
export const CURRENT_DIRECTORS_PATH = OFFICER_FILING + CURRENT_DIRECTORS;
export const ACTIVE_DIRECTORS_DETAILS = ACTIVE_SUBMISSION_BASE + "/active-directors-details";
export const ACTIVE_DIRECTORS_DETAILS_PATH = OFFICER_FILING + ACTIVE_DIRECTORS_DETAILS;
export const REGISTERED_OFFICE_ADDRESS = ACTIVE_SUBMISSION_BASE + "/registered-office-address";
export const REGISTERED_OFFICE_ADDRESS_PATH = OFFICER_FILING + REGISTERED_OFFICE_ADDRESS;
export const REVIEW = ACTIVE_SUBMISSION_BASE + "/review";
export const REVIEW_PATH = OFFICER_FILING + REVIEW;
export const CONFIRMATION = ACTIVE_SUBMISSION_BASE + "/confirmation";
export const CONFIRMATION_PATH = OFFICER_FILING + CONFIRMATION;
export const PAYMENT_CALLBACK = ACTIVE_SUBMISSION_BASE + "/payment-callback";
export const PAYMENT_CALLBACK_PATH = OFFICER_FILING + PAYMENT_CALLBACK;
export const INVALID_COMPANY_STATUS = "/invalid-company-status";
export const INVALID_COMPANY_STATUS_PATH = OFFICER_FILING + INVALID_COMPANY_STATUS + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const USE_PAPER = "/paper-filing";
export const USE_PAPER_PATH = OFFICER_FILING + USE_PAPER + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const USE_WEBFILING = "/use-webfiling";
export const USE_WEBFILING_PATH = OFFICER_FILING + USE_WEBFILING + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const NO_FILING_REQUIRED = "/no-filing-required";
export const NO_FILING_REQUIRED_PATH = OFFICER_FILING + NO_FILING_REQUIRED + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const DATE_DIRECTOR_REMOVED_PATH_END = "/date-director-removed";
export const DATE_DIRECTOR_REMOVED = ACTIVE_SUBMISSION_BASE + DATE_DIRECTOR_REMOVED_PATH_END;
export const DATE_DIRECTOR_REMOVED_PATH = OFFICER_FILING + DATE_DIRECTOR_REMOVED;
export const REMOVE_DIRECTOR_CHECK_ANSWERS = ACTIVE_SUBMISSION_BASE + "/remove-director-check-answers";
export const REMOVE_DIRECTOR_CHECK_ANSWERS_PATH = OFFICER_FILING + REMOVE_DIRECTOR_CHECK_ANSWERS;
export const REMOVE_DIRECTOR_SUBMITTED = ACTIVE_SUBMISSION_BASE + "/remove-director-submitted";
export const REMOVE_DIRECTOR_SUBMITTED_PATH = OFFICER_FILING + REMOVE_DIRECTOR_SUBMITTED;
export const CHECK_YOUR_ANSWERS_PATH_END = "director-check-answers";

export const STOP_PAGE_END = "/cannot-use";
export const BASIC_STOP_PAGE = COMPANY_AUTH_PROTECTED_BASE + STOP_PAGE_END;
export const BASIC_STOP_PAGE_PATH = OFFICER_FILING + BASIC_STOP_PAGE + `?${URL_QUERY_PARAM.PARAM_STOP_TYPE}={${URL_QUERY_PARAM.PARAM_STOP_TYPE}}`;
export const APPID_STOP_PAGE = ACTIVE_BASE + CONTAINS_SUBMISSION_ID + STOP_PAGE_END;
export const APPID_STOP_PAGE_PATH = OFFICER_FILING + APPID_STOP_PAGE + `?${URL_QUERY_PARAM.PARAM_STOP_TYPE}={${URL_QUERY_PARAM.PARAM_STOP_TYPE}}`;

// AP01
export const DIRECTOR_NAME_PATH_END = "/director-name"
export const DIRECTOR_NAME = ACTIVE_SUBMISSION_BASE + DIRECTOR_NAME_PATH_END;
export const DIRECTOR_NAME_PATH = OFFICER_FILING + DIRECTOR_NAME;

export const DIRECTOR_DATE_DETAILS_PATH_END = "/director-date-details"
export const DIRECTOR_DATE_DETAILS = ACTIVE_SUBMISSION_BASE + DIRECTOR_DATE_DETAILS_PATH_END;
export const DIRECTOR_DATE_DETAILS_PATH = OFFICER_FILING + DIRECTOR_DATE_DETAILS;

export const DIRECTOR_NATIONALITY_PATH_END = "/director-nationality"
export const DIRECTOR_NATIONALITY = ACTIVE_SUBMISSION_BASE + DIRECTOR_NATIONALITY_PATH_END;
export const DIRECTOR_NATIONALITY_PATH = OFFICER_FILING + DIRECTOR_NATIONALITY;

export const DIRECTOR_OCCUPATION_PATH_END = "/director-occupation"
export const DIRECTOR_OCCUPATION = ACTIVE_SUBMISSION_BASE + DIRECTOR_OCCUPATION_PATH_END;
export const DIRECTOR_OCCUPATION_PATH = OFFICER_FILING + DIRECTOR_OCCUPATION;

export const DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END = "/director-correspondence-address"
export const DIRECTOR_CORRESPONDENCE_ADDRESS = ACTIVE_SUBMISSION_BASE + DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END;
export const DIRECTOR_CORRESPONDENCE_ADDRESS_PATH = OFFICER_FILING + DIRECTOR_CORRESPONDENCE_ADDRESS;

export const DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH_END = "/link-correspondence-address"
export const DIRECTOR_CORRESPONDENCE_ADDRESS_LINK = ACTIVE_SUBMISSION_BASE + DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH_END;
export const DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH = OFFICER_FILING + DIRECTOR_CORRESPONDENCE_ADDRESS_LINK;

export const DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH_END  = "/link-correspondence-address-enter-manually"
export const DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY = ACTIVE_SUBMISSION_BASE + DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH_END;
export const DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH = OFFICER_FILING + DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY;

export const DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END = "/director-correspondence-address-search"
export const DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH = ACTIVE_SUBMISSION_BASE + DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END;
export const DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH = OFFICER_FILING + DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH;

export const DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END = "/choose-correspondence-address"
export const DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS = ACTIVE_SUBMISSION_BASE + DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END;
export const DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH = OFFICER_FILING + DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS;

export const DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH_END = "/director-correspondence-address-manual"
export const DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL = ACTIVE_SUBMISSION_BASE + DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH_END;
export const DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH = OFFICER_FILING + DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL;

export const DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END = "/confirm-director-correspondence-address"
export const DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS = ACTIVE_SUBMISSION_BASE + DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END;
export const DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH = OFFICER_FILING + DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS;

export const DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END = "/director-home-address"
export const DIRECTOR_RESIDENTIAL_ADDRESS = ACTIVE_SUBMISSION_BASE + DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END;
export const DIRECTOR_RESIDENTIAL_ADDRESS_PATH = OFFICER_FILING + DIRECTOR_RESIDENTIAL_ADDRESS;

export const DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END = "/link-home-address"
export const DIRECTOR_RESIDENTIAL_ADDRESS_LINK = ACTIVE_SUBMISSION_BASE + DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END;
export const DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH = OFFICER_FILING + DIRECTOR_RESIDENTIAL_ADDRESS_LINK;

export const DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END = "/director-home-address-search"
export const DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH = ACTIVE_SUBMISSION_BASE + DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END;
export const DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH = OFFICER_FILING + DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH;

export const DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END = "/choose-home-address"
export const DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS = ACTIVE_SUBMISSION_BASE + DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END;
export const DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH = OFFICER_FILING + DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS;

export const DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END = "/director-home-address-manual"
export const DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL = ACTIVE_SUBMISSION_BASE + DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END;
export const DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH = OFFICER_FILING + DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL;

export const DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END = "/confirm-director-home-address"
export const DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS = ACTIVE_SUBMISSION_BASE + DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END;
export const DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH = OFFICER_FILING + DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS;

export const DIRECTOR_PROTECTED_DETAILS_PATH_END = "/director-personal-information-protected"
export const DIRECTOR_PROTECTED_DETAILS = ACTIVE_SUBMISSION_BASE + DIRECTOR_PROTECTED_DETAILS_PATH_END;
export const DIRECTOR_PROTECTED_DETAILS_PATH = OFFICER_FILING + DIRECTOR_PROTECTED_DETAILS;

export const APPOINT_PATH = "/appoint-";
export const APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END = APPOINT_PATH + CHECK_YOUR_ANSWERS_PATH_END;
export const APPOINT_DIRECTOR_CHECK_ANSWERS = ACTIVE_SUBMISSION_BASE + APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END;
export const APPOINT_DIRECTOR_CHECK_ANSWERS_PATH = OFFICER_FILING + APPOINT_DIRECTOR_CHECK_ANSWERS;

export const APPOINT_DIRECTOR_SUBMITTED_PATH_END = "/appoint-director-submitted"
export const APPOINT_DIRECTOR_SUBMITTED = ACTIVE_SUBMISSION_BASE + APPOINT_DIRECTOR_SUBMITTED_PATH_END;
export const APPOINT_DIRECTOR_SUBMITTED_PATH = OFFICER_FILING + APPOINT_DIRECTOR_SUBMITTED;

// UPDATE
export const UPDATE_PATH = "/update-";
export const UPDATE_DIRECTOR_DETAILS_END = UPDATE_PATH + "director-details";
export const UPDATE_DIRECTOR_DETAILS = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_DETAILS_END;
export const UPDATE_DIRECTOR_DETAILS_PATH = OFFICER_FILING + UPDATE_DIRECTOR_DETAILS;

export const UPDATE_DIRECTOR_CHECK_ANSWERS_END = UPDATE_PATH + CHECK_YOUR_ANSWERS_PATH_END;
export const UPDATE_DIRECTOR_CHECK_ANSWERS = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_CHECK_ANSWERS_END;
export const UPDATE_DIRECTOR_CHECK_ANSWERS_PATH = OFFICER_FILING + UPDATE_DIRECTOR_CHECK_ANSWERS;

export const UPDATE_DIRECTOR_NAME_END = UPDATE_PATH + "director-name";
export const UPDATE_DIRECTOR_NAME = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_NAME_END;
export const UPDATE_DIRECTOR_NAME_PATH = OFFICER_FILING + UPDATE_DIRECTOR_NAME;

export const DIRECTOR_DATE_OF_CHANGE_PATH_END = UPDATE_PATH + "date";
export const DIRECTOR_DATE_OF_CHANGE = ACTIVE_SUBMISSION_BASE + DIRECTOR_DATE_OF_CHANGE_PATH_END;
export const DIRECTOR_DATE_OF_CHANGE_PATH = OFFICER_FILING + DIRECTOR_DATE_OF_CHANGE;

export const UPDATE_DIRECTOR_OCCUPATION_END = UPDATE_PATH + "director-occupation";
export const UPDATE_DIRECTOR_OCCUPATION = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_OCCUPATION_END;
export const UPDATE_DIRECTOR_OCCUPATION_PATH = OFFICER_FILING + UPDATE_DIRECTOR_OCCUPATION;

export const UPDATE_DIRECTOR_NATIONALITY_PATH_END = UPDATE_PATH + "director-nationality";
export const UPDATE_DIRECTOR_NATIONALITY = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_NATIONALITY_PATH_END;
export const UPDATE_DIRECTOR_NATIONALITY_PATH = OFFICER_FILING + UPDATE_DIRECTOR_NATIONALITY;

export const UPDATE_DIRECTOR_SUBMITTED_PATH_END = UPDATE_PATH + "director-submitted";
export const UPDATE_DIRECTOR_SUBMITTED = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_SUBMITTED_PATH_END;
export const UPDATE_DIRECTOR_SUBMITTED_PATH = OFFICER_FILING + UPDATE_DIRECTOR_SUBMITTED;

export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END = UPDATE_PATH + "director-correspondence-address";
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END;
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH = OFFICER_FILING + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS;

export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END = UPDATE_PATH + "find-director-correspondence-address";
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END;
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH = OFFICER_FILING + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH;

export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_END = UPDATE_PATH + "enter-director-correspondence-address";
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_END;
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH = OFFICER_FILING + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL;

export const UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END = UPDATE_PATH + "confirm-director-correspondence-address";
export const UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END;
export const UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH = OFFICER_FILING + UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS;

export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END = UPDATE_PATH + "choose-a-correspondence-address";
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END;
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH = OFFICER_FILING + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS;

export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH_END = "link-correspondence-update";
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH_END;
export const UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH = OFFICER_FILING + UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK;

export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END = UPDATE_PATH + "director-home-address";
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END;
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH = OFFICER_FILING + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS;

export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END = UPDATE_PATH + "find-director-home-address-search";
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END;
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH = OFFICER_FILING + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH;

export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END = UPDATE_PATH + "enter-director-home-address";
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END;
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH = OFFICER_FILING + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL;

export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END = UPDATE_PATH + "choose-a-home-address";
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END;
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH = OFFICER_FILING + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS;

export const UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END = UPDATE_PATH + "confirm-director-home-address";
export const UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END;
export const UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH = OFFICER_FILING + UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS;

export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END = "link-home-update";
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK = ACTIVE_SUBMISSION_BASE + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END;
export const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH = OFFICER_FILING + UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK;