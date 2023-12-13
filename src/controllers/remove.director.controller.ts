import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { 
  CURRENT_DIRECTORS_PATH,
  REMOVE_DIRECTOR_CHECK_ANSWERS_PATH,
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
import { patchOfficerFiling, getOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";
import { formatTitleCase, retrieveDirectorNameFromAppointment } from "../utils/format";
import { validateDate } from "../validation/date.validation";
import { ValidationError } from "../model/validation.model";
import { formatValidationErrors } from "../validation/validation";
import { RemovalDateValidation} from "../validation/remove.date.validation.config";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const appointmentId = officerFiling.referenceAppointmentId;
    if (appointmentId === undefined) {
      throw new Error("Appointment id is undefined");
    }

    // Get the director name from company appointments
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    if (officerFiling.resignedOn) {
      var dateFields = officerFiling.resignedOn.split('-');
      return displayPopulatedPage(dateFields, appointment, req, res);
    }

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
    const session: Session = req.session as Session;
    
    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const appointmentId = officerFiling.referenceAppointmentId;
    if (appointmentId === undefined) {
      throw new Error("Appointment id is undefined");
    }

    // Get current etag within the appointment
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    // Get date of resignation
    const day = req.body[RemovalDateField.DAY];
    const month = req.body[RemovalDateField.MONTH];
    const year = req.body[RemovalDateField.YEAR];
    const resignationDate = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');   // Get date in the format yyyy-mm-dd

    // Validate the date fields (JS)
    const dateValidationResult = validateDate(day, month, year, RemovalDateValidation);
    if (dateValidationResult) {
      return displayErrorMessage(dateValidationResult, appointment, req, res);
    }

    // Patch filing with etag and resignation date
    const updateFiling: OfficerFiling = {
      resignedOn: resignationDate
    }
    await patchOfficerFiling(session, transactionId, submissionId, updateFiling);

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
    const nextPageUrl = urlUtils.getUrlToPath(REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

/**
 * Return the page with the rendered error message
 */
function displayErrorMessage(validationResult: ValidationError, appointment: CompanyAppointment, req: Request, res: Response<any, Record<string, any>>) {
  const errors = formatValidationErrors([validationResult]);
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
    removal_date : {
      "removal_date-day" : dateFields[2],
      "removal_date-month" : dateFields[1],
      "removal_date-year" : dateFields[0]
    }
  };
  const backLink = urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req);

  return res.render(Templates.REMOVE_DIRECTOR, {
    directorName: formatTitleCase(retrieveDirectorNameFromAppointment(appointment)),
    backLinkUrl: backLink,
    templateName: Templates.REMOVE_DIRECTOR,
    ...dates,
  });
}