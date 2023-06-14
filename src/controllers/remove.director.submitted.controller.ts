import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getDirectorAndTerminationDate } from "../services/remove.directors.check.answers.service";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/officer-filing/types";
import { setAppointedOnDate, toReadableFormat, toReadableFormatMonthYear } from "../utils/date";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const companyOfficer: CompanyOfficer = await getDirectorAndTerminationDate(session, transactionId, submissionId);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

    if(companyOfficer.resignedOn === undefined){
      throw Error("Resigned on date is missing for submissionId: " + submissionId);
    }


    return res.render(Templates.REMOVE_DIRECTOR_SUBMITTED, {
      templateName: Templates.REMOVE_DIRECTOR_SUBMITTED,
      referenceNumber: transactionId,
      companyNumber: companyNumber,
      companyName: companyProfile.companyName,
      name: companyOfficer.name,
      resignedOn: toReadableFormat(companyOfficer.resignedOn)
    });
  } catch (e) {
    return next(e);
  }
};
