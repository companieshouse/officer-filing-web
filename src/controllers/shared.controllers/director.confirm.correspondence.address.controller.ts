import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getDirectorNameBasedOnJourney } from "../../utils/web";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { isCorrespondenceAddressUpdated } from "../../utils/is.address.updated";


export const getConfirmCorrespondence = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate?: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    let enterAddressManuallyUrl: string;

    if(isUpdate){
      enterAddressManuallyUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req)
    } else {
      enterAddressManuallyUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req)
  }

    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: urlUtils.getUrlToPath(backUrlPath, req),
      directorName: formatTitleCase(await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling)),
      enterAddressManuallyUrl: enterAddressManuallyUrl,
      ...officerFiling.serviceAddress
    });

  } catch (e) {
    return next(e);
  }
};

export const postConfirmCorrespondence = async (req: Request, res: Response, next: NextFunction, nextPageUrl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    
    const officerFilingBody: OfficerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: false
    };

    if(isUpdate){
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const appointmentId = officerFiling.referenceAppointmentId as string;
      const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      if (isCorrespondenceAddressUpdated(officerFiling, companyAppointment)) {
        officerFilingBody.correspondenceAddressHasBeenUpdated = true;
      }
      else {
        officerFilingBody.correspondenceAddressHasBeenUpdated = false;
      }
    }
    
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
    return res.redirect(urlUtils.getUrlToPath(nextPageUrl, req));
  }catch(e){
    return next(e);
  }
};
