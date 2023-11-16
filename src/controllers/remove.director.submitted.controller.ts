import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing/types";
import { toReadableFormat } from "../utils/date";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { getOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";
import { CREATE_TRANSACTION_PATH } from "../types/page.urls";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;

    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
  
    if(officerFiling.referenceAppointmentId === undefined){
      throw Error("Reference appointment ID is missing for submissionId: " + submissionId);
    }
    if (officerFiling.resignedOn === undefined) {
      throw Error("Resigned on date is missing for submissionId: " + submissionId);
    }

    const companyOfficer: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, officerFiling.referenceAppointmentId);

    const firstname = companyOfficer.forename != null ? formatTitleCase(companyOfficer.forename) : "";
    const surname = companyOfficer.surname != null ? formatTitleCase(companyOfficer.surname) : "";
    const directorName = firstname + " " + surname;

    return res.render(Templates.REMOVE_DIRECTOR_SUBMITTED, {
      templateName: Templates.REMOVE_DIRECTOR_SUBMITTED,
      referenceNumber: transactionId,
      companyNumber: companyNumber,
      companyName: companyProfile.companyName,
      name: directorName,
      resignedOn: toReadableFormat(officerFiling.resignedOn),
      removeLink: urlUtils.getUrlToPath(CREATE_TRANSACTION_PATH, req)
    });
  } catch (e) {
    return next(e);
  }
};
