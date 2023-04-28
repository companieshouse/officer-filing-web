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
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getListActiveDirectorDetails } from "../services/active.directors.details.service";
import { getCompanyProfile } from "../services/company.profile.service";
import { buildPaginationElement } from "../utils/pagination";
import { logger } from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const directors: CompanyOfficer[] = await getListActiveDirectorDetails(session, transactionId);
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const officerLists = buildOfficerLists(directors);



    // TODO: Testing pagination - tidy this up
    let page = req.query["page"];
    const pageNumber = isNaN(Number(page))? 1: Number(page);

    let objectsPerPage = 5;
    let startIndex = (pageNumber - 1) * objectsPerPage;
    let endIndex = startIndex + objectsPerPage;
    let numOfPages = Math.ceil(officerLists.directorsList.length / objectsPerPage);

    const directorsList = [...officerLists.directorsList, ...officerLists.corporateDirectorsList];
    const paginatedDirectorsList = directorsList.slice(startIndex, endIndex);
    const urlPrefix = "/officer-filing-web/company/" + companyNumber + "/transaction/" + transactionId + "/active-directors";
    let paginationData = buildPaginationElement(pageNumber, numOfPages, urlPrefix);



    return res.render(Templates.ACTIVE_DIRECTORS, {
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: getConfirmCompanyUrl(companyNumber),
      directorsList: paginatedDirectorsList,
      company: companyProfile,
      pagination: paginationData
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
    .filter(officer => equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.DIRECTOR) || equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.NOMINEE_DIRECTOR))
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
    .filter(officer => equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.CORPORATE_DIRECTOR) || equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.CORPORATE_NOMINEE_DIRECTOR))
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
    directorsList: copyOfficers(buildDirectorsList(officers), 55),
    corporateDirectorsList: buildCorporateDirectorsList(officers),
  };
};

// TODO: Remove - testing more officers for pagination
const copyOfficers = (officers: CompanyOfficer[], numTimes: number): any[] => {
  const newArray: CompanyOfficer[] = [];
  for (let i = 0; i < numTimes; i++) {
    newArray.push(...officers);
  }
  return newArray;
}

const getConfirmCompanyUrl = (companyNumber: string): string => `${CONFIRM_COMPANY_PATH}?companyNumber=${companyNumber}`;