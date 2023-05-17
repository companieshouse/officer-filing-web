import { NextFunction, Request, Response } from "express";
import { REMOVE_DIRECTOR_PATH, REMOVE_DIRECTOR_SUBMITTED_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/officer-filing/types";
import { buildDateString, getDirectorAndTerminationDate, getMonthString } from "../services/remove.directors.check.answers.service";
import { Session } from "@companieshouse/node-session-handler";
import { ACTIVE_DIRECTORS_PATH } from "../types/page.urls";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const companyOfficer: CompanyOfficer = await getDirectorAndTerminationDate(session, transactionId, submissionId);
    
    if(companyOfficer.resignedOn === undefined){
      throw Error("Resigned on date is missing for submissionId: " + submissionId);
    }

    var dateOfBirth = "";
    if(companyOfficer.dateOfBirth?.day !== undefined && companyOfficer.dateOfBirth?.day !== "undefined"){
      dateOfBirth = companyOfficer.dateOfBirth?.day + " ";
    }
    dateOfBirth = dateOfBirth + getMonthString(companyOfficer.dateOfBirth?.month) + " " + companyOfficer.dateOfBirth?.year;
    var corporateDirector = false;
    if(companyOfficer.officerRole === "corporate-director"){
      corporateDirector = true;
    }

    return res.render(Templates.REMOVE_DIRECTOR_CHECK_ANSWERS, {
      templateName: Templates.REMOVE_DIRECTOR_CHECK_ANSWERS,
      backLinkUrl: urlUtils.getUrlToPath(REMOVE_DIRECTOR_PATH, req),
      company: companyProfile,
      name: companyOfficer.name,
      dateOfBirth: dateOfBirth,
      appointedOn: buildDateString(companyOfficer.appointedOn),
      resignedOn: buildDateString(companyOfficer.resignedOn),
      corporateDirector: corporateDirector,
      changeLink: urlUtils.getUrlToPath(REMOVE_DIRECTOR_PATH, req),
      cancelLink:  urlUtils.getUrlToPath(ACTIVE_DIRECTORS_PATH, req)
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.redirect(REMOVE_DIRECTOR_SUBMITTED_PATH);
  } catch (e) {
    return next(e);
  }
};
