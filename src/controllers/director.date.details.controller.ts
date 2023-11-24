import { NextFunction, Request, Response } from "express";
import { DIRECTOR_NAME_PATH, DIRECTOR_NATIONALITY_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { ValidationError } from "../model/validation.model";
import { OfficerFiling, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { createValidationError, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { appointmentDateErrorMessageKey, dobDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { AppointmentDateField, DobDateField } from "../model/date.model";
import { validateDate } from "../validation/date.validation";
import { DobDateValidation } from "../validation/dob.date.validation.config";
import { getValidationStatus } from "../services/validation.status.service";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { setBackLink, setRedirectLink } from "../utils/web";
import { buildDateString } from "../utils/date";
import { AppointmentDateValidation } from "../validation/appointment.date.validation.config";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    var dateOfBirthFields = officerFiling.dateOfBirth ? officerFiling.dateOfBirth.split('-').reverse() : [];
    var dateOfAppointmentFields = officerFiling.appointedOn ? officerFiling.appointedOn.split('-').reverse() : [];

    return renderPage(res, req, officerFiling, [], dateOfBirthFields, dateOfAppointmentFields);

  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    // Get date of birth
    const dobDay = req.body[DobDateField.DAY];
    const dobMonth = req.body[DobDateField.MONTH];
    const dobYear = req.body[DobDateField.YEAR];
    // Get date of appointment
    const appointementDay = req.body[AppointmentDateField.DAY];
    const appointementMonth = req.body[AppointmentDateField.MONTH];
    const appointementYear = req.body[AppointmentDateField.YEAR];

    // Validate the date fields (JS)
    const dobValidationError = validateDate(dobDay, dobMonth, dobYear, DobDateValidation);
    const appointmentValidationError = validateDate(appointementDay, appointementMonth, appointementYear, AppointmentDateValidation);
    const dateValidationErrors:ValidationError[] = [];
    if (dobValidationError || appointmentValidationError) {
      
      if(dobValidationError){
        dateValidationErrors.push(dobValidationError);
      }
      if(appointmentValidationError){
        dateValidationErrors.push(appointmentValidationError);
      }
      return renderPage(res, req, officerFiling, dateValidationErrors, [dobDay, dobMonth, dobYear], [appointementDay, appointementMonth, appointementYear]);
    }

    const dateOfBirth = buildDateString(dobDay, dobMonth, dobYear);
    const dateOfAppointment = buildDateString(appointementDay, appointementMonth, appointementYear);
    
    // Patch filing
    const updateFiling: OfficerFiling = {
      dateOfBirth: dateOfBirth,
      appointedOn: dateOfAppointment
    };
    await patchOfficerFiling(session, transactionId, submissionId, updateFiling);

    // Get validation status and check for errors
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    const validationErrors = buildValidationErrors(validationStatus);
    if (validationErrors.length > 0) {
      return renderPage(res, req, officerFiling, validationErrors, [dobDay, dobMonth, dobYear], [appointementDay, appointementMonth, appointementYear]);
    }

    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req);
    return res.redirect(await setRedirectLink(req, officerFiling.checkYourAnswersLink, nextPageUrl));

  } catch (e) {
    return next(e);
  }
};

/**
 * Build a list of error objects that will be displayed on the page, based on the result from API getValidation.
 * Only certain relevant errors to do with the elements on the page will be returned, others will be ignored.
 * 
 * @param validationStatusResponse Response from running getValidation. Contains the api validation messages
 * @returns A list of ValidationError objects that contain the messages and info to display on the page
 */
export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  // Day/Month/Year API Validation
  var dobMissingDayKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, dobDateErrorMessageKey);
  if (dobMissingDayKey) {
    validationErrors.push(createValidationError(dobMissingDayKey, [DobDateField.DAY, DobDateField.MONTH, DobDateField.YEAR], DobDateField.DAY));
  }
  var appointMissingDayKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, appointmentDateErrorMessageKey);
  if (appointMissingDayKey) {
    validationErrors.push(createValidationError(appointMissingDayKey, [AppointmentDateField.DAY, AppointmentDateField.MONTH, AppointmentDateField.YEAR], AppointmentDateField.DAY));
  }

  return validationErrors;
}

/**
 * Render the page with all expected elements - eg errors, pre-populated data, etc.
 */
const renderPage = (res: Response, req: Request, officerFiling: OfficerFiling, validationErrors: ValidationError[], dateOfBirth: string[], dateOfAppointment: string[]) => {
  const dates = {
    dob_date: {
      "dob_date-day": dateOfBirth[0],
      "dob_date-month": dateOfBirth[1],
      "dob_date-year": dateOfBirth[2],
    },
    appointment_date: {
      "appointment_date-day": dateOfAppointment[0],
      "appointment_date-month": dateOfAppointment[1],
      "appointment_date-year": dateOfAppointment[2]
    }
  };

  return res.render(Templates.DIRECTOR_DATE_DETAILS, {
    templateName: Templates.DIRECTOR_DATE_DETAILS,
    // backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req)),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    errors: formatValidationErrors(validationErrors),
    ...dates,
  });
}
