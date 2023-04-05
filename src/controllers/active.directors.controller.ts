import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CONFIRM_COMPANY_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import {
  DIRECTOR_DETAILS_ERROR,
  OFFICER_ROLE } from "../utils/constants";
  import {
    equalsIgnoreCase,
    formatTitleCase,
    formatDateOfBirth,
    formatAppointmentDate
  } from "../utils/format";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { Session } from "@companieshouse/node-session-handler";
import { getListActiveDirectorDetails } from "../services/active.directors.details.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const directors: CompanyOfficer[] = await getListActiveDirectorDetails(session, transactionId);
    const officerLists = buildOfficerLists(directors);

    return res.render(Templates.ACTIVE_DIRECTORS, {
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: urlUtils.getUrlToPath(CONFIRM_COMPANY_PATH, req),
      directorsList: officerLists.directorsList,
      corporateDirectorsList: officerLists.corporateDirectorsList
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const activeOfficerDetailsBtnValue = req.body.activeOfficers;

      return res.render(Templates.ACTIVE_DIRECTORS, {
        backLinkUrl: urlUtils.getUrlToPath(CONFIRM_COMPANY_PATH, req),
        officerErrorMsg: DIRECTOR_DETAILS_ERROR,
        templateName: Templates.ACTIVE_DIRECTORS,
      });
  } catch (e) {
    return next(e);
  }
};

const buildDirectorsList = (officers: CompanyOfficer[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.DIRECTOR || OFFICER_ROLE.NOMINEE_DIRECTOR))
    .map(officer => {
      return {
        name: officer.name,
        officerRole: formatTitleCase(officer.officerRole),
        dateOfBirth: formatDateOfBirth(officer.dateOfBirth),
        appointedOn: formatAppointmentDate(officer.appointedOn)
      };
    });
};

const buildCorporateDirectorsList = (officers: CompanyOfficer[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.CORPORATE_DIRECTOR || OFFICER_ROLE.CORPORATE_NOMINEE_DIRECTOR))
    .map(officer => {
      return {
        name: officer.name,
        officerRole: formatTitleCase(officer.officerRole),
        appointedOn: formatAppointmentDate(officer.appointedOn)
      };
    });
};

const buildOfficerLists = (officers: CompanyOfficer[]): any => {
  return {
    directorsList: buildDirectorsList(officers),
    corporateDirectorsList: buildCorporateDirectorsList(officers),
  };
};
