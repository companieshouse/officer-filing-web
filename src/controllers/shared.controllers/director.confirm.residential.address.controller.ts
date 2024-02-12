import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../utils/format";
import { getDirectorNameBasedOnJourney } from "../../utils/web";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsResidentialAddressUpdated } from "./director.residential.address.link.controller";

export const getDirectorConfirmResidentialAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, manualEntryUrl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
  
    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: urlUtils.getUrlToPath(backUrlPath, req),
      directorName: formatTitleCase(directorName),
      enterAddressManuallyUrl: urlUtils.getUrlToPath(manualEntryUrl, req),
      ...officerFiling.residentialAddress
    });
  } catch (e) {
    return next(e);
  }
};

export const postDirectorConfirmResidentialAddress = async (req: Request, res: Response, next: NextFunction, checkYourAnswersLink: string, nextPageurl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFilingBody: OfficerFiling = {
      isHomeAddressSameAsServiceAddress: false
    };

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    if (isUpdate) {
      const appointmentId = officerFiling.referenceAppointmentId as string;
      const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      officerFilingBody.residentialAddressHasBeenUpdated = checkIsResidentialAddressUpdated(
        { ...officerFilingBody,
        residentialAddress: officerFiling.residentialAddress }, companyAppointment);
    }

    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    if (officerFiling.checkYourAnswersLink) {
      return res.redirect(urlUtils.getUrlToPath(checkYourAnswersLink, req));
    }
    return res.redirect(urlUtils.getUrlToPath(nextPageurl, req));
  } catch (e) {
    return next(e);
  }
};