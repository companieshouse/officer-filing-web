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
import { retrieveErrorMessageToKey, retrieveStopPageTypeToDisplay } from "../services/remove.directors.error.keys.service";
import { patchOfficerFiling, getOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";
import { formatDirectorNameForDisplay } from "../utils/format";
import { validateDate } from "../validation/date.validation";
import { ValidationError } from "../model/validation.model";
import { formatValidationErrors } from "../validation/validation";
import { RemovalDateValidation} from "../validation/remove.date.validation.config";
import { getLocaleInfo, getLocalesService, selectLang, addLangToUrl } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const appointmentId = officerFiling.referenceAppointmentId;
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    if (appointmentId === undefined) {
      throw new Error("Appointment id is undefined");
    }

    // Get the director name from company appointments
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    //Format name based on corporate or individual director
   let directorName = formatDirectorNameForDisplay(appointment);

    if (officerFiling.resignedOn) {
      let dateFields = officerFiling.resignedOn.split('-');
      return displayPopulatedPage(dateFields, appointment, directorName, req, res);
    }

    return res.render(Templates.REMOVE_DIRECTOR, {
      directorName: directorName,
      templateName: Templates.REMOVE_DIRECTOR,
      backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req), lang),
      ...getLocaleInfo(locales, lang),
      currentUrl: req.originalUrl,
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
    const lang = selectLang(req.query.lang);

    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const appointmentId = officerFiling.referenceAppointmentId;
    if (appointmentId === undefined) {
      throw new Error("Appointment id is undefined");
    }

    // Get current etag within the appointment
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
    
    //Format name based on corporate or individual director
    let directorName = formatDirectorNameForDisplay(appointment);

    // Get date of resignation
    const day = req.body[RemovalDateField.DAY];
    const month = req.body[RemovalDateField.MONTH];
    const year = req.body[RemovalDateField.YEAR];
    const resignationDate = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');   // Get date in the format yyyy-mm-dd

    // Validate the date fields (JS)
    let removeDateValidationErrors: ValidationError[] = [];
    let dateValidationResult = validateDate(day, month, year, RemovalDateValidation);
    if (dateValidationResult) {
      removeDateValidationErrors.push(dateValidationResult);
      return displayErrorMessage(removeDateValidationErrors, appointment, directorName, req, res);
    }

    // Patch filing with the resignation date
    const updateFiling: OfficerFiling = {
      resignedOn: resignationDate
    }
    await patchOfficerFiling(session, transactionId, submissionId, updateFiling);

    // Validate the filing (API)
    const validationStatus: ValidationStatusResponse = await getValidationStatus(session, transactionId, submissionId);
    if (validationStatus.errors) {
      const errorMessageKey = retrieveErrorMessageToKey(validationStatus, RemovalDateValidation);
      if (errorMessageKey) {
        removeDateValidationErrors.push(errorMessageKey);
        return displayErrorMessage(removeDateValidationErrors, appointment, directorName, req, res);
      }

     const stopPageType = retrieveStopPageTypeToDisplay(validationStatus);
     if (stopPageType) {
      let stopPageUrl = urlUtils.getUrlToPath(APPID_STOP_PAGE_PATH, req).replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, appointmentId);
      stopPageUrl = addLangToUrl(urlUtils.setQueryParam(stopPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, stopPageType), lang);
      return res.redirect(stopPageUrl);
     }
    }

    // Successfully progress to next page
    const nextPageUrl = addLangToUrl(urlUtils.getUrlToPath(REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, req), lang);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

/**
 * Return the page with the rendered error message
 */
function displayErrorMessage(validationErrors: ValidationError[], appointment: CompanyAppointment, directorName: string, req: Request, res: Response<any, Record<string, any>>) {

  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const dates = {
    [RemovalDateKey]: Object.values(RemovalDateField).reduce((o, key) => Object.assign(o as string, { [key as string]: req.body[key as string] }), {})
  };
  const backLink = addLangToUrl(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req), lang);

  return res.render(Templates.REMOVE_DIRECTOR, {
    directorName: directorName,
    backLinkUrl: backLink,
    templateName: Templates.REMOVE_DIRECTOR,
    ...req.body,
    ...dates,
    ...getLocaleInfo(locales, lang),
    currentUrl: req.originalUrl,
    errors: formatValidationErrors(validationErrors, lang)
  });
}

function displayPopulatedPage(dateFields: string[], appointment: CompanyAppointment, directorName: string, req: Request, res: Response<any, Record<string, any>>) {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const dates = {
    removal_date : {
      "removal_date-day" : dateFields[2],
      "removal_date-month" : dateFields[1],
      "removal_date-year" : dateFields[0]
    }
  };
  const backLink = addLangToUrl(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req), lang);

  return res.render(Templates.REMOVE_DIRECTOR, {
    directorName: directorName,
    backLinkUrl: backLink,
    templateName: Templates.REMOVE_DIRECTOR,
    ...dates,
    ...getLocaleInfo(locales, lang),
    currentUrl: req.originalUrl,
  });
}