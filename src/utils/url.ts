import { Request } from "express";
import { urlParams, URL_QUERY_PARAM, OFFICER_FILING } from "../types/page.urls";
import { logger } from "./logger";
import { URL_LOG_MAX_LENGTH, URL_PARAM_MAX_LENGTH } from "./properties";

const getUrlWithCompanyNumber = (url: string, companyNumber: string): string =>
  url.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber);

const getUrlWithCompanyNumberTransactionIdAndSubmissionId = (url: string, companyNumber: string,
                                                          transactionId: string, submissionId: string): string => {
  url = url.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber)
    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, transactionId)
    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, submissionId);
  return url;
};

const getUrlToPath = (pathToPage: string, req: Request): string => {
  return getUrlWithCompanyNumberTransactionIdAndSubmissionId(pathToPage,
                                                             getCompanyNumberFromRequestParams(req),
                                                             getTransactionIdFromRequestParams(req),
                                                             getSubmissionIdFromRequestParams(req)
  );
};

const getCompanyNumberFromRequestParams = (req: Request): string => sanitizeCompanyNumber(req.params[urlParams.PARAM_COMPANY_NUMBER]);
const getTransactionIdFromRequestParams = (req: Request): string => sanitizeTransactionId(req.params[urlParams.PARAM_TRANSACTION_ID]);
const getSubmissionIdFromRequestParams = (req: Request): string => sanitizeSubmissionId(req.params[urlParams.PARAM_SUBMISSION_ID]);
const getAppointmentIdFromRequestParams = (req: Request): string => sanitizeAppointmentId(req.params[urlParams.PARAM_APPOINTMENT_ID]);

export const sanitizeCompanyNumber = (companyNumber: string): string => {
  if (companyNumber) {
    return companyNumber.replace(/[^a-zA-Z0-9]/g, "");
  }
  return "";
}

const sanitizeTransactionId = (transactionId: string): string => {
  if (transactionId) {
    return transactionId.replace(/[^0-9-]/g, "");
  }
  return "";
}

const sanitizeSubmissionId = (submissionId: string): string => {
  if (submissionId) {
    return submissionId.replace(/[^a-z0-9]/g, "");
  }
  return "";
}

const sanitizeAppointmentId = (appointmentId: string): string => {
  if (appointmentId) {
    return appointmentId.replace(/[^a-zA-Z0-9-_]/g, "");
  }
  return "";
}

export const sanitizeStopType = (stopType): string => {
  if (stopType && typeof stopType === "string") {
    return stopType.replace(/[^a-z0-9-]/g, "");
  }
  return "";
}

const getBackLinkFromRequestParams = (req: Request): string | undefined => {
  const backLink = req.query[urlParams.PARAM_BACK_LINK];
  if (typeof backLink === "string") {
      return backLink;
  }
  return undefined;
}

const setQueryParam = (url: string, paramName: URL_QUERY_PARAM, value: string) =>
  url.replace(`{${paramName}}`, value);

// This function will truncate the req.originalUrl and req.url
// When using the logger.xxxRequest functions, they will log the full path which
// might be very large if a malicious url was entered.
const truncateRequestUrls = (req: Request) => {
  if (req.originalUrl?.length > URL_LOG_MAX_LENGTH) {
    req.originalUrl = `${req.originalUrl.substring(0, URL_LOG_MAX_LENGTH)}...`;
  }
  if (req.url?.length > URL_LOG_MAX_LENGTH) {
    req.url = `${req.url.substring(0, URL_LOG_MAX_LENGTH)}...`;
  }
};

// This function will modify the req.originalUrl and req.url if present and replace a specified value
// with another
const replaceValueInRequestUrls = (req: Request, valueToReplace: string, replaceWith: string) => {
  if (req.originalUrl) {
    req.originalUrl = req.originalUrl.replace(valueToReplace, replaceWith);
  }
  if (req.url) {
    req.url = req.url.replace(valueToReplace, replaceWith);
  }
};

// Will truncate the param value if greater than allowed length and modifies
// the req.originalUrl and req.url to replace the too long value with truncated value
const sanitiseParam = (req: Request, paramName: string, paramValue: string) => {
  if (paramValue?.length > URL_PARAM_MAX_LENGTH) {
    logger.debug(`sanitiseParam - truncating param ${paramName}`);
    const truncatedParamValue = `${paramValue.substring(0, URL_PARAM_MAX_LENGTH)}...`;
    replaceValueInRequestUrls(req, paramValue, truncatedParamValue);
  }
};

// Will encode any special characters found in the req.originalUrl and req.url
const encodeUrls = (req: Request) => {
  req.originalUrl = encodeURI(req.originalUrl);
  req.url = encodeURI(req.url);
};

// Make the req.originalUrl and req.url safe for logging
const sanitiseReqUrls = (req: Request) => {
  // loop through the urlParams enum (contains known url param names) and see if they are present in the url.
  // if they are present and they are longer than allowed length, truncate them.
  for (const urlParamName of Object.values(urlParams)) {
    const urlParamValue = req.params[urlParamName];
    sanitiseParam(req, urlParamName, urlParamValue);
  }
  // loop through the names of the query params in the url and get their values
  // if the values are longer than allowed length, truncate them.
  if (req.query) {
    for (const queryParamName of Object.keys(req.query)) {
      const queryParamValue: string = req.query[queryParamName] as string;
      sanitiseParam(req, queryParamName, queryParamValue);
    }
  }
  // need to truncate the originalUrl in the request to make sure it is not greater than the max allowed
  // url length for logging.
  // it could contain a large amount of data if maliciously entered so truncate to stop logs filling up
  truncateRequestUrls(req);

  encodeUrls(req);
};

export const urlUtils = {
  getCompanyNumberFromRequestParams,
  getTransactionIdFromRequestParams,
  getSubmissionIdFromRequestParams,
  getAppointmentIdFromRequestParams,
  getBackLinkFromRequestParams,
  getUrlToPath,
  getUrlWithCompanyNumber,
  getUrlWithCompanyNumberTransactionIdAndSubmissionId,
  sanitiseReqUrls: sanitiseReqUrls,
  setQueryParam,
};

export const getPreviousPageQueryParamUrl = (req: Request) => {
  const previousPageQueryParam = req.query.previousPage;
  return previousPageQueryParam && typeof previousPageQueryParam === 'string' && previousPageQueryParam.startsWith(OFFICER_FILING) ? previousPageQueryParam : getPreviousPageUrl(req)
};

const getPreviousPageUrl = (req: Request) => {
  const headers = req.rawHeaders;
  const absolutePreviousPageUrl = headers.filter(item => item.includes(OFFICER_FILING))[0];
  if (!absolutePreviousPageUrl) {
      return OFFICER_FILING;
  }

  const indexOfRelativePath = absolutePreviousPageUrl.indexOf(OFFICER_FILING);
  return absolutePreviousPageUrl.substring(indexOfRelativePath);
};
