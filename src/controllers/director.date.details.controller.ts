import { NextFunction, Request, Response } from "express";
import { DIRECTOR_DATE_DETAILS_PATH, DIRECTOR_NAME_PATH, DIRECTOR_NATIONALITY_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { ValidationError } from "../model/validation.model";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { formatValidationErrors } from "../validation/validation";
import { AppointmentDateField, DobDateField } from "../model/date.model";
import { validateDateOfAppointment, validateDateOfBirth } from "../validation/date.validation";
import { DobDateValidation } from "../validation/dob.date.validation.config";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { getFromCheckYourAnswers, setBackLink, setRedirectLink } from "../utils/web";
import { buildDateString } from "../utils/date";
import { AppointmentDateValidation } from "../validation/appointment.date.validation.config";
import { getCompanyProfile } from "../services/company.profile.service";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    var dateOfBirthFields = officerFiling.dateOfBirth ? officerFiling.dateOfBirth.split('-').reverse() : [];
    var dateOfAppointmentFields = officerFiling.appointedOn ? officerFiling.appointedOn.split('-').reverse() : [];
    officerFiling.checkYourAnswersLink = getFromCheckYourAnswers(req, officerFiling);
    
    return renderPage(res, req, officerFiling, [], dateOfBirthFields, dateOfAppointmentFields);

  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const companyProfile = await getCompanyProfile(companyNumber);

    // Get date of birth
    const dobDay = req.body[DobDateField.DAY];
    const dobMonth = req.body[DobDateField.MONTH];
    const dobYear = req.body[DobDateField.YEAR];
    // Get date of appointment
    const appointementDay = req.body[AppointmentDateField.DAY];
    const appointementMonth = req.body[AppointmentDateField.MONTH];
    const appointementYear = req.body[AppointmentDateField.YEAR];

    // Validate the date fields (JS)
    let dobValidationError = validateDateOfBirth(dobDay, dobMonth, dobYear, DobDateValidation);
    const dateOfBirth = new Date(parseInt(dobYear), parseInt(dobMonth) - 1, parseInt(dobDay));
    let appointmentValidationError = validateDateOfAppointment(appointementDay, appointementMonth, appointementYear, AppointmentDateValidation, dateOfBirth, companyProfile);
    
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

    const dateOfBirthString = buildDateString(dobDay, dobMonth, dobYear);
    const dateOfAppointmentString = buildDateString(appointementDay, appointementMonth, appointementYear);
    
    // Patch filing
    const updateFiling: OfficerFiling = {
      dateOfBirth: dateOfBirthString,
      appointedOn: dateOfAppointmentString
    };
    await patchOfficerFiling(session, transactionId, submissionId, updateFiling);

    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req);
    const lang = selectLang(req.query.lang);
    return res.redirect(addLangToUrl(await setRedirectLink(req, officerFiling.checkYourAnswersLink, nextPageUrl), lang));

  } catch (e) {
    return next(e);
  }
};

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

  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();

  return res.render(Templates.DIRECTOR_DATE_DETAILS, {
    templateName: Templates.DIRECTOR_DATE_DETAILS,
    ...getLocaleInfo(locales, lang),
    currentUrl: urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req),
    backLinkUrl: addLangToUrl(setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req)), lang),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    errors: formatValidationErrors(validationErrors, lang),
    ...dates,
  });
}
