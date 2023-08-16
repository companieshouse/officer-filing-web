import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { 
  CURRENT_DIRECTORS_PATH, 
  ACTIVE_OFFICERS_PATH_END, 
  REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, 
  DATE_DIRECTOR_REMOVED_PATH_END, 
  OFFICER_FILING, 
  urlParams,
  URL_QUERY_PARAM,
  APPID_STOP_PAGE_PATH} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { ValidationStatusResponse, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getValidationStatus } from "../services/validation.status.service";
import {
  RemovalDateField,
  RemovalDateKey
} from "../model/date.model";
import { retrieveErrorMessageToDisplay, retrieveStopPageTypeToDisplay } from "../services/remove.directors.error.keys.service";
import { patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";
import { formatTitleCase, retrieveDirectorNameFromAppointment } from "../utils/format";
import { formatValidationError, validateDate } from "../validation/date.validation";
import { ValidationError } from "../model/validation.model";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const appointmentId = urlUtils.getAppointmentIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;

    // Get the director name from company appointments
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    return res.render(Templates.REMOVE_DIRECTOR, {
      directorName: formatTitleCase(retrieveDirectorNameFromAppointment(appointment)),
      templateName: Templates.REMOVE_DIRECTOR,
      backLinkUrl: urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const appointmentId = urlUtils.getAppointmentIdFromRequestParams(req);
    const session: Session = req.session as Session;
    
    // Get current etag within the appointment
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    // Get date of resignation
    const day = req.body[RemovalDateField.DAY];
    const month = req.body[RemovalDateField.MONTH];
    const year = req.body[RemovalDateField.YEAR];
    const resignationDate = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');   // Get date in the format yyyy-mm-dd

    // Validate the date fields (JS)
    const dateValidationResult = validateDate(day, month, year);
    if (dateValidationResult) {
      return displayErrorMessage(dateValidationResult, appointment, req, res);
    }

    // Patch filing with etag and resignation date
    const officerFiling: OfficerFiling = {
      referenceEtag: appointment.etag,
      resignedOn: resignationDate
    }
    await patchOfficerFiling(session, transactionId, submissionId, officerFiling);

    // Validate the filing (API)
    const validationStatus: ValidationStatusResponse = await getValidationStatus(session, transactionId, submissionId);
    if (validationStatus.errors) {
      const errorMessage = retrieveErrorMessageToDisplay(validationStatus);
      if (errorMessage) {
        const validationResult: ValidationError = {
          messageKey: errorMessage,
          source: [RemovalDateField.DAY, RemovalDateField.MONTH, RemovalDateField.YEAR],
          link: RemovalDateField.DAY
        }
        return displayErrorMessage(validationResult, appointment, req, res);
      }
     const stopPageType = retrieveStopPageTypeToDisplay(validationStatus);
     if (stopPageType) {
      var stopPageUrl = urlUtils.getUrlToPath(APPID_STOP_PAGE_PATH, req).replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, appointmentId);
      stopPageUrl = urlUtils.setQueryParam(stopPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, stopPageType);
      return res.redirect(stopPageUrl);
     }
    }

    // Successfully progress to next page
    const nextPageUrl = urlUtils.getUrlToPath(REMOVE_DIRECTOR_CHECK_ANSWERS_PATH.replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, req.params[urlParams.PARAM_APPOINTMENT_ID]), req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

/**
 * Return the page with the rendered error message
 */
function displayErrorMessage(validationResult: ValidationError, appointment: CompanyAppointment, req: Request, res: Response<any, Record<string, any>>) {
  const errors = formatValidationError(validationResult);
  const dates = {
    [RemovalDateKey]: Object.values(RemovalDateField).reduce((o, key) => Object.assign(o as string, { [key as string]: req.body[key as string] }), {})
  };
  const backLink = urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req);

  return res.render(Templates.REMOVE_DIRECTOR, {
    directorName: formatTitleCase(retrieveDirectorNameFromAppointment(appointment)),
    backLinkUrl: backLink,
    templateName: Templates.REMOVE_DIRECTOR,
    ...req.body,
    ...dates,
    errors
  });
}

function displayPopulatedPage(dateFields: string[], appointment: CompanyAppointment, req: Request, res: Response<any, Record<string, any>>) {
  const dates = {
    [RemovalDateKey]: Object.values(RemovalDateField).reduce((o, key) => Object.assign(o as string, { [key as string]: dateFields.forEach }), {})
  };
  const backLink = urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req);
  console.log(dates);

  return res.render(Templates.REMOVE_DIRECTOR, {
    directorName: formatTitleCase(retrieveDirectorNameFromAppointment(appointment)),
    backLinkUrl: backLink,
    templateName: Templates.REMOVE_DIRECTOR,
    ...req.body,
    ...dates,
  });
}
