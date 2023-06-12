import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { ACTIVE_DIRECTORS_PATH, CONFIRM_COMPANY_PATH, REMOVE_DIRECTOR_PATH, SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM, urlParams } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import {
  DIRECTOR_DETAILS_ERROR,
  OFFICER_ROLE, 
  STOP_TYPE} from "../utils/constants";
  import {
    equalsIgnoreCase,
    formatTitleCase,
    formatDateOfBirth,
  } from "../utils/format";
import { CompanyOfficer, OfficerCard } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getListActiveDirectorDetails } from "../services/active.directors.details.service";
import { getCompanyProfile } from "../services/company.profile.service";
import { buildPaginationElement } from "../utils/pagination";
import { setAppointedOnDate } from "../utils/date";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const directorDtoList: CompanyOfficer[] = await getListActiveDirectorDetails(session, transactionId);
    // Redirect to stop screen if there are no directors
    if(directorDtoList.length === 0){
      var stopPageRedirectUrl = urlUtils.setQueryParam(SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM.COMPANY_NUM, companyNumber);
      stopPageRedirectUrl = urlUtils.setQueryParam(stopPageRedirectUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.NO_DIRECTORS);
      return res.redirect(stopPageRedirectUrl);
    }
    const directorList = createOfficerCards(req, [...buildIndividualDirectorsList(directorDtoList), ...buildCorporateDirectorsList(directorDtoList)]);

    

    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

    // Get current page number
    let page = req.query["page"];
    const pageNumber = isNaN(Number(page))? 1: Number(page);

    // Get list of directors to show on current page
    const objectsPerPage = 5;
    const startIndex = (pageNumber - 1) * objectsPerPage;
    const endIndex = startIndex + objectsPerPage;
    const paginatedDirectorsList = directorList.slice(startIndex, endIndex);

    // Create pagination element to navigate pages
    const numOfPages = Math.ceil(directorList.length / objectsPerPage);
    const paginationElement = buildPaginationElement(pageNumber, numOfPages, urlUtils.getUrlToPath(ACTIVE_DIRECTORS_PATH, req));

    return res.render(Templates.ACTIVE_DIRECTORS, {
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: getConfirmCompanyUrl(companyNumber),
      directorsList: paginatedDirectorsList,
      company: companyProfile,
      pagination: paginationElement
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

const buildIndividualDirectorsList = (officers: CompanyOfficer[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.DIRECTOR) || equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.NOMINEE_DIRECTOR))
    .map(officer => {
      const appointedOn = setAppointedOnDate(officer);
      return {
        name: officer.name,
        officerRole: formatTitleCase(officer.officerRole),
        dateOfBirth: formatDateOfBirth(officer.dateOfBirth),
        appointedOn: appointedOn,
        links: officer.links
      };
    });
};

const buildCorporateDirectorsList = (officers: CompanyOfficer[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.CORPORATE_DIRECTOR) || equalsIgnoreCase(officer.officerRole, OFFICER_ROLE.CORPORATE_NOMINEE_DIRECTOR))
    .map(officer => {
      const appointedOn = setAppointedOnDate(officer);
      return {
        name: officer.name,
        officerRole: formatTitleCase(officer.officerRole),
        appointedOn: appointedOn,
        links: officer.links
      };
    });
};

const getConfirmCompanyUrl = (companyNumber: string): string => `${CONFIRM_COMPANY_PATH}?companyNumber=${companyNumber}`;

const createOfficerCards = (req: Request, officers: CompanyOfficer[]): OfficerCard[] => {
  return officers
    .filter(officer => getAppointmentIdFromSelfLink(officer).length)
    .map(officer => {
      return {
        removeUrl: urlUtils.getUrlToPath(REMOVE_DIRECTOR_PATH, req).replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, getAppointmentIdFromSelfLink(officer)),
        officer: officer
      }
    })
};

/**
 * Extract the referenced appointment ID from the officers self link URL
 * @param officer The officer containing the link
 * @returns The appointment ID if available, or an empty string if not
 */
const getAppointmentIdFromSelfLink = (officer: CompanyOfficer): string => {
  if (officer.links != undefined) {
    const self = officer.links.self;
    if (self != undefined) {
      const matches = self.match("\/appointments\/([^\/]+)");
      if (matches && matches[1]) {
        return matches[1];
      }
    }
  }
  return "";
};
