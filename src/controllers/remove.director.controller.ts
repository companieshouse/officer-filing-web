import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { 
  ACTIVE_DIRECTORS_PATH, 
  ACTIVE_OFFICERS_PATH_END, 
  REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, 
  REMOVE_DIRECTOR_PATH_END, 
  OFFICER_FILING, 
  urlParams,
  URL_QUERY_PARAM,
  APPID_STOP_PAGE_PATH} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { ValidationStatusResponse, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { FormattedValidationErrors } from "../middleware/validation.middleware"
import { getValidationStatus } from "../services/validation.status.service";
import {
  RemovalDateKey,
  RemovalDateKeys
} from "../model/date.model";
import { retrieveErrorMessageToDisplay, retrieveStopPageTypeToDisplay } from "../services/remove.directors.error.keys.service";
import { patchOfficerFiling, postOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";
import { formatTitleCase, retrieveDirectorNameFromAppointment } from "../utils/format";

var filingId: string;

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const appointmentId = urlUtils.getAppointmentIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    
    // Create and post officer filing and retrieve filing ID
    const filingResponse = await postOfficerFiling(session, transactionId, appointmentId);
    filingId = filingResponse.id;

    // Get the director name from company appointments
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    return res.render(Templates.REMOVE_DIRECTOR, {
      directorName: formatTitleCase(retrieveDirectorNameFromAppointment(appointment)),
      templateName: Templates.REMOVE_DIRECTOR,
      backLinkUrl: urlUtils.getUrlToPath(ACTIVE_DIRECTORS_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.params[urlParams.PARAM_SUBMISSION_ID] = filingId;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const appointmentId = urlUtils.getAppointmentIdFromRequestParams(req);
    const session: Session = req.session as Session;

    // Get date of resignation
    const day = req.body[RemovalDateKeys[0]];
    const month = req.body[RemovalDateKeys[1]];
    const year = req.body[RemovalDateKeys[2]];
    const resignationDate = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');   // Get date in the format yyyy-mm-dd

    // Get current etag within the appointment
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    // Patch filing with etag and resignation date
    const officerFiling: OfficerFiling = {
      referenceEtag: appointment.etag,
      resignedOn: resignationDate
    }
    await patchOfficerFiling(session, transactionId, filingId, officerFiling);

    // Validate the filing
    const validationStatus: ValidationStatusResponse = await getValidationStatus(session, transactionId, filingId);

    // Handle any errors
    if (validationStatus.errors) {
      const errorMessage = retrieveErrorMessageToDisplay(validationStatus);
      if (errorMessage) {
        return displayErrorMessage(errorMessage, appointment, req, res);
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
function displayErrorMessage(errorMessage: string, appointment: CompanyAppointment, req: Request, res: Response<any, Record<string, any>>) {
  const errors = formatValidationError(errorMessage);
  const dates = {
    [RemovalDateKey]: RemovalDateKeys.reduce((o, key) => Object.assign(o, { [key]: req.body[key] }), {})
  };
  const backLink = OFFICER_FILING + req.route.path.replace(REMOVE_DIRECTOR_PATH_END, ACTIVE_OFFICERS_PATH_END);

  return res.render(Templates.REMOVE_DIRECTOR, {
    directorName: formatTitleCase(retrieveDirectorNameFromAppointment(appointment)),
    backLinkUrl: backLink,
    templateName: Templates.REMOVE_DIRECTOR,
    ...req.body,
    ...dates,
    errors
  });
}

/**
 * Format the validation errors to always highlight the 'day' field when clicked
 * @param errorMessage The message to be displayed to the user
 * @returns A validation errors object to display on the page
 */
export function formatValidationError(errorMessage: string): FormattedValidationErrors {
  const errors = { errorList: [] } as any;
    errors.errorList.push({ href: '#removal_date-day', text: errorMessage });
    errors["removal_date-day"] = { text: errorMessage };
  return errors;
}
