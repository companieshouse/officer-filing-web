import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CURRENT_DIRECTORS_PATH, CONFIRM_COMPANY_PATH, DATE_DIRECTOR_REMOVED_PATH, BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM, urlParams, DIRECTOR_NAME_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import {
  OFFICER_ROLE, 
  STOP_TYPE} from "../utils/constants";
  import {
    equalsIgnoreCase,
    formatTitleCase,
    formatDateOfBirth,
  } from "../utils/format";
import { CompanyOfficer, OfficerCard, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { getListActiveDirectorDetails } from "../services/active.directors.details.service";
import { getCompanyProfile } from "../services/company.profile.service";
import { buildPaginationElement } from "../utils/pagination";
import { setAppointedOnDate } from "../utils/date";
import { isActiveFeature } from "../utils/feature.flag";
import { AP01_ACTIVE } from "../utils/properties";
import { postOfficerFiling } from "../services/officer.filing.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const directorDtoList: CompanyOfficer[] = await getListActiveDirectorDetails(session, transactionId);

    // Redirect to stop screen if there are no directors
    if(directorDtoList.length === 0){
      var stopPageRedirectUrl = urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req);
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
    const paginationElement = buildPaginationElement(pageNumber, numOfPages, urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req));

    let appointDisabled = '""'
    // Hide the appoint button if feature is disabled
    if(!isActiveFeature(AP01_ACTIVE))
    {
      appointDisabled = "display:none"
    }

    return res.render(Templates.ACTIVE_DIRECTORS, {
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: getConfirmCompanyUrl(companyNumber),
      directorsList: paginatedDirectorsList,
      company: companyProfile,
      pagination: paginationElement,
      appointDisabled: appointDisabled
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const appointmentId = req.body.appointmentId;
  const session: Session = req.session as Session;

  //If there is no appoinmentId sent in the post, it must be an AP01
  if (!appointmentId) {

    // Create and post officer filing and retrieve filing ID
    const emptyFiling: OfficerFiling = {};
    const filingResponse = await postOfficerFiling(session, transactionId, emptyFiling);

    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_NAME_PATH.replace(`:${urlParams.PARAM_SUBMISSION_ID}`, filingResponse.id), req);
    return res.redirect(nextPageUrl);
  }

  const officerFiling: OfficerFiling = {
    referenceAppointmentId: appointmentId
  };
  const filingResponse = await postOfficerFiling(session, transactionId, officerFiling);
  const filingId = filingResponse.id;
  
  req.params[urlParams.PARAM_SUBMISSION_ID] = filingId;
  
  const nextPageUrl = urlUtils.getUrlToPath(DATE_DIRECTOR_REMOVED_PATH.replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, appointmentId), req);
  return res.redirect(nextPageUrl);
  
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
        appointmentId: getAppointmentIdFromSelfLink(officer),
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
