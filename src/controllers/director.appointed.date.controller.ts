import { OfficerFiling, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { AppointmentDateField } from "../model/date.model";
import { ValidationError } from "../model/validation.model";
import { formatTitleCase } from "../services/confirm.company.service";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { getValidationStatus } from "../services/validation.status.service";
import { DIRECTOR_DATE_OF_BIRTH_PATH, DIRECTOR_NATIONALITY_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { appointmentDateErrorMessageKey } from "../utils/api.enumerations.keys";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { urlUtils } from "../utils/url";
import { AppointmentDateValidation } from "../validation/appointment.date.validation.config";
import { validateDate } from "../validation/date.validation";
import { createValidationError, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { setBackLink, setRedirectLink } from "../utils/web";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    var dateFields = officerFiling.appointedOn ? officerFiling.appointedOn.split('-').reverse() : [];

    return renderPage(res, req, officerFiling, [], dateFields);

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

    // Get date of appointment
    const day = req.body[AppointmentDateField.DAY];
    const month = req.body[AppointmentDateField.MONTH];
    const year = req.body[AppointmentDateField.YEAR];
    const dateOfAppointment = year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');   // Get date in the format yyyy-mm-dd

    // Validate the date fields (JS)
    const jsValidationError = validateDate(day, month, year, AppointmentDateValidation);
    if (jsValidationError) {
      return renderPage(res, req, officerFiling, [jsValidationError], [day, month, year]);
    }

    // Patch filing
    const updateFiling: OfficerFiling = {
      appointedOn: dateOfAppointment
    };
    await patchOfficerFiling(session, transactionId, submissionId, updateFiling);

    // Get validation status and check for errors
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    const validationErrors = buildValidationErrors(validationStatus);
    if (validationErrors.length > 0) {
      return renderPage(res, req, officerFiling, validationErrors, [day, month, year]);
    }
  
    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req);
    return res.redirect(await setRedirectLink(req, officerFiling.checkYourAnswersLink, nextPageUrl));

  } catch (e) {
    return next(e);
  }
};

export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  // Day/Month/Year API Validation
  var appointMissingDayKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, appointmentDateErrorMessageKey);
  if (appointMissingDayKey) {
    validationErrors.push(createValidationError(appointMissingDayKey, [AppointmentDateField.DAY, AppointmentDateField.MONTH, AppointmentDateField.YEAR], AppointmentDateField.DAY));
  }

  return validationErrors;
}

/**
 * Render the page with all expected elements - eg errors, pre-populated data, etc.
 */
const renderPage = (res: Response, req: Request, officerFiling: OfficerFiling, validationErrors: ValidationError[], dayMonthYear: string[]) => {
  const dates = {
    appointment_date: {
      "appointment_date-day": dayMonthYear[0],
      "appointment_date-month": dayMonthYear[1],
      "appointment_date-year": dayMonthYear[2]
    }
  };

  return res.render(Templates.DIRECTOR_APPOINTED_DATE, {
    templateName: Templates.DIRECTOR_APPOINTED_DATE,
    backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_DATE_OF_BIRTH_PATH, req)),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    errors: formatValidationErrors(validationErrors),
    ...dates,
  });
}

