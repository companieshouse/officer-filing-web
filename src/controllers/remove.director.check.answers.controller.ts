import { NextFunction, Request, Response } from "express";
import { CURRENT_DIRECTORS_PATH, DATE_DIRECTOR_REMOVED_PATH, REMOVE_DIRECTOR_SUBMITTED_PATH, BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM, urlParams } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getValidationStatus } from "../services/validation.status.service";
import { closeTransaction } from "../services/transaction.service";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/officer-filing/types";
import { getDirectorAndTerminationDate } from "../services/remove.directors.check.answers.service";
import { retrieveStopPageTypeToDisplay } from "../services/remove.directors.error.keys.service";
import { Session } from "@companieshouse/node-session-handler";
import { setAppointedOnDate, toReadableFormat, toReadableFormatMonthYear } from "../utils/date";
import { equalsIgnoreCase, formatTitleCase, retrieveDirectorNameFromOfficer  } from "../utils/format";
import { OFFICER_ROLE } from "../utils/constants";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";
import { getOfficerFiling } from "../services/officer.filing.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const companyOfficer: CompanyOfficer = await getDirectorAndTerminationDate(session, transactionId, submissionId);
    const appointmentId = (await getOfficerFiling(session, transactionId, submissionId)).referenceAppointmentId as string;
    if (appointmentId === undefined) {
      throw new Error("Appointment id is undefined");
    }
    const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId)

    if(companyOfficer.resignedOn === undefined){
      throw Error("Resigned on date is missing for submissionId: " + submissionId);
    }

    var dateOfBirth = "";
    if(companyOfficer.dateOfBirth !== undefined){
      dateOfBirth = companyOfficer.dateOfBirth?.year;
      if(companyOfficer.dateOfBirth?.day !== undefined){
        dateOfBirth = toReadableFormat(companyOfficer.dateOfBirth?.year + "-" + companyOfficer.dateOfBirth?.month + "-" + companyOfficer.dateOfBirth?.day);
      }
      else if(companyOfficer.dateOfBirth?.month !== undefined){
        dateOfBirth = toReadableFormatMonthYear(Number(companyOfficer.dateOfBirth?.month), Number(companyOfficer.dateOfBirth?.year));
      }
    }

    var corporateDirector = false;
    if(equalsIgnoreCase(companyOfficer.officerRole, OFFICER_ROLE.CORPORATE_DIRECTOR) || equalsIgnoreCase(companyOfficer.officerRole, OFFICER_ROLE.CORPORATE_NOMINEE_DIRECTOR)){
      corporateDirector = true;
    }

    return res.render(Templates.REMOVE_DIRECTOR_CHECK_ANSWERS, {
      templateName: Templates.REMOVE_DIRECTOR_CHECK_ANSWERS,
      backLinkUrl: urlUtils.getUrlToPath(DATE_DIRECTOR_REMOVED_PATH, req),
      company: companyProfile,
      directorTitle: formatTitleCase(appointment.title),
      name: formatTitleCase(retrieveDirectorNameFromOfficer(companyOfficer)),
      dateOfBirth: dateOfBirth,
      appointedOn: setAppointedOnDate(companyOfficer),
      resignedOn: toReadableFormat(companyOfficer.resignedOn),
      corporateDirector: corporateDirector,
      changeLink: urlUtils.getUrlToPath(DATE_DIRECTOR_REMOVED_PATH, req),
      cancelLink:  urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req)
    });
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

    const validationStatus: ValidationStatusResponse = await getValidationStatus(session, transactionId, submissionId);
    const stopQuery = retrieveStopPageTypeToDisplay(validationStatus);

    if (stopQuery) {
      return res.redirect(
        urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), 
        URL_QUERY_PARAM.PARAM_STOP_TYPE, stopQuery));
    }

    await closeTransaction(session, companyNumber, submissionId, transactionId);

    const nextPageUrl = urlUtils.getUrlToPath(REMOVE_DIRECTOR_SUBMITTED_PATH, req);

    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};
