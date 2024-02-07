import { NextFunction, Request, Response } from "express";
import { UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, UPDATE_DIRECTOR_DETAILS_PATH, } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../services/confirm.company.service";
import { retrieveDirectorNameFromAppointment } from "../../utils/format";
import { getCompanyProfile } from "../../services/company.profile.service";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorDateOfChangeField } from "../../model/date.model";
import { DirectorDateOfChangeValidation } from "../../validation/director.date.of.change.validation.config";
import { buildDateString } from "../../utils/date";
import { validateDateOfChange } from "../../validation/date.validation";
import { ValidationError } from "../../model/validation.model";
import { formatValidationErrors } from "../../validation/validation";
import { getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { setBackLink } from "../../utils/web";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling : OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const dateOfChangeFields = officerFiling.directorsDetailsChangedDate ? officerFiling.directorsDetailsChangedDate.split('-').reverse() : [];

    return renderPage(resp, req, officerFiling, [], dateOfChangeFields, companyNumber);
  } catch(e) {
    return next(e);
  }
};

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  try{
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;

    const companyProfile = await getCompanyProfile(companyNumber);
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    // Get date of change
    const docDay = req.body[DirectorDateOfChangeField.DAY];
    const docMonth = req.body[DirectorDateOfChangeField.MONTH];
    const docYear = req.body[DirectorDateOfChangeField.YEAR];

    // Validate the date fields (JS)
    let changeOfDateValidationErrors: ValidationError[] = [];
    let docValidateError = validateDateOfChange(docDay, docMonth, docYear, DirectorDateOfChangeValidation, companyProfile, officerFiling);
    const dateOfChangeString = buildDateString(docDay, docMonth, docYear);

    if(docValidateError) {
      changeOfDateValidationErrors.push(docValidateError);
      return renderPage(resp, req, officerFiling, changeOfDateValidationErrors, [docDay, docMonth, docYear], companyNumber)
    }

    //Patch the officer filing
    const updatedFiling: OfficerFiling = {
      directorsDetailsChangedDate: dateOfChangeString,
    }

    await patchOfficerFiling(session, transactionId, submissionId, updatedFiling);

    return resp.redirect(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, req));
  } catch(e) {
    return next(e);
  }

}

const renderPage = async (res: Response, req: Request, officerFiling: OfficerFiling, validationErrors: ValidationError[], dateOfChangeFields: string[], companyNumber: string,) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(req.session as Session, companyNumber, officerFiling.referenceAppointmentId as string);
  const date = {
    date_of_change: {
      "date_of_change-day": dateOfChangeFields[0],
      "date_of_change-month": dateOfChangeFields[1],
      "date_of_change-year": dateOfChangeFields[2]
    }
  };

  return res.render(Templates.DIRECTOR_DATE_OF_CHANGE, {
    templateName: Templates.DIRECTOR_DATE_OF_CHANGE,
    backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req), lang),
    directorName: formatTitleCase(retrieveDirectorNameFromAppointment(companyAppointment)),
    errors: formatValidationErrors(validationErrors, lang),
    ...officerFiling,
    ...date,
    ...getLocaleInfo(locales, lang),
    currentUrl: req.originalUrl,
  });
}
