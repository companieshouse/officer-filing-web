import { ACCOUNT_URL } from "../utils/properties";
import { Templates } from "./template.paths";

export enum urlParams {
  PARAM_COMPANY_NUMBER = "companyNumber",
  PARAM_TRANSACTION_ID = "transactionId",
  PARAM_SUBMISSION_ID = "submissionId"
}

export enum URL_QUERY_PARAM {
  COMPANY_NUM = "companyNumber",
  PARAM_TRANSACTION_ID = "transactionId",
  PARAM_SUBMISSION_ID = "submissionId",
  IS_PSC = "isPsc"
}

const SEPARATOR = "/";

export const COMPANY_AUTH_PROTECTED_BASE = `/company/:${urlParams.PARAM_COMPANY_NUMBER}/`;
export const ACTIVE_SUBMISSION_BASE = COMPANY_AUTH_PROTECTED_BASE +
  `transaction/:${urlParams.PARAM_TRANSACTION_ID}/submission/:${urlParams.PARAM_SUBMISSION_ID}/`;
export const ACTIVE_BASE = COMPANY_AUTH_PROTECTED_BASE +
  `transaction/:${urlParams.PARAM_TRANSACTION_ID}/`;
export const CONTAINS_TRANSACTION_ID = `/transaction/:${urlParams.PARAM_TRANSACTION_ID}`;
export const CONTAINS_SUBMISSION_ID = `/submission/:${urlParams.PARAM_SUBMISSION_ID}`;


// Use _PATH consts for redirects
// Use const without _PATH to match the url in the routes.ts
export const ACCESSIBILITY_STATEMENT = SEPARATOR + Templates.ACCESSIBILITY_STATEMENT;
export const ACCOUNTS_SIGNOUT_PATH = `${ACCOUNT_URL}/signout`;
export const CONFIRM_COMPANY = SEPARATOR + Templates.CONFIRM_COMPANY;
export const OFFICER_FILING = "/officer-filing-web";
export const COMPANY_NUMBER = "/company-number";
export const COMPANY_LOOKUP = "/company-lookup/search?forward="+OFFICER_FILING+"/confirm-company?companyNumber={companyNumber}";
export const CONFIRM_COMPANY_PATH = OFFICER_FILING + CONFIRM_COMPANY;
export const SIGNOUT_PATH = "/signout";
export const CREATE_TRANSACTION = COMPANY_AUTH_PROTECTED_BASE + "transaction";
export const CREATE_TRANSACTION_PATH = OFFICER_FILING + CREATE_TRANSACTION;
export const TRADING_STATUS = ACTIVE_SUBMISSION_BASE + "trading-status";
export const TRADING_STATUS_PATH = OFFICER_FILING + TRADING_STATUS ;
export const ACTIVE_DIRECTORS = ACTIVE_BASE + "active-directors";
export const ACTIVE_DIRECTORS_PATH = OFFICER_FILING + ACTIVE_DIRECTORS;
export const ACTIVE_DIRECTORS_DETAILS = ACTIVE_SUBMISSION_BASE + "active-directors-details";
export const ACTIVE_DIRECTORS_DETAILS_PATH = OFFICER_FILING + ACTIVE_DIRECTORS_DETAILS;
export const REGISTERED_OFFICE_ADDRESS = ACTIVE_SUBMISSION_BASE + "registered-office-address";
export const REGISTERED_OFFICE_ADDRESS_PATH = OFFICER_FILING + REGISTERED_OFFICE_ADDRESS;
export const REVIEW = ACTIVE_SUBMISSION_BASE + "review";
export const REVIEW_PATH = OFFICER_FILING + REVIEW;
export const CONFIRMATION = ACTIVE_SUBMISSION_BASE + "confirmation";
export const CONFIRMATION_PATH = OFFICER_FILING + CONFIRMATION;
export const PAYMENT_CALLBACK = ACTIVE_SUBMISSION_BASE + "payment-callback";
export const PAYMENT_CALLBACK_PATH = OFFICER_FILING + PAYMENT_CALLBACK;
export const INVALID_COMPANY_STATUS = "/invalid-company-status";
export const INVALID_COMPANY_STATUS_PATH = OFFICER_FILING + INVALID_COMPANY_STATUS + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const USE_PAPER = "/paper-filing";
export const USE_PAPER_PATH = OFFICER_FILING + USE_PAPER + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const USE_WEBFILING = "/use-webfiling";
export const USE_WEBFILING_PATH = OFFICER_FILING + USE_WEBFILING + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const NO_FILING_REQUIRED = "/no-filing-required";
export const NO_FILING_REQUIRED_PATH = OFFICER_FILING + NO_FILING_REQUIRED + `?${URL_QUERY_PARAM.COMPANY_NUM}={${URL_QUERY_PARAM.COMPANY_NUM}}`;
export const REMOVE_DIRECTOR = "/company/00006400/transaction/020002-120116-793219/submission/1/remove-director";
export const REMOVE_DIRECTOR_PATH = OFFICER_FILING + REMOVE_DIRECTOR;
//Hardcoded for now
//export const REMOVE_DIRECTOR_CHECK_ANSWERS = ACTIVE_SUBMISSION_BASE + "remove-director-check-answers";
//export const REMOVE_DIRECTOR_CHECK_ANSWERS_PATH = OFFICER_FILING + REMOVE_DIRECTOR_CHECK_ANSWERS;
export const REMOVE_DIRECTOR_CHECK_ANSWERS = "/company/00006400/transaction/020002-120116-793219/submission/1/remove-director-check-answers";
export const REMOVE_DIRECTOR_CHECK_ANSWERS_PATH = OFFICER_FILING + REMOVE_DIRECTOR_CHECK_ANSWERS;
export const REMOVE_DIRECTOR_SUBMITTED = "/company/00006400/transaction/020002-120116-793219/submission/1/remove-director-submitted";
export const REMOVE_DIRECTOR_SUBMITTED_PATH = OFFICER_FILING + REMOVE_DIRECTOR_SUBMITTED;



