import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CURRENT_DIRECTORS_PATH, CONFIRM_COMPANY_PATH, DATE_DIRECTOR_REMOVED_PATH, BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM, 
        urlParams, DIRECTOR_NAME_PATH, UPDATE_DIRECTOR_DETAILS_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import {
  OFFICER_ROLE,
  allowedPublicCompanyTypes} from "../utils/constants";
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
import { AP01_ACTIVE, CH01_ACTIVE, PIWIK_APPOINT_DIRECTOR_START_GOAL_ID, PIWIK_REMOVE_DIRECTOR_START_GOAL_ID, PIWIK_UPDATE_DIRECTOR_START_GOAL_ID } from "../utils/properties";
import { postOfficerFiling } from "../services/officer.filing.service";
import { PaginationData } from "../types";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../utils/localise";
import { logger } from "../utils/logger";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const directorDtoList: CompanyOfficer[] = await getListActiveDirectorDetails(session, transactionId);
    console.log("************DTO LIST")
    console.log(directorDtoList[0])
    const directorList = createOfficerCards(req, [...buildIndividualDirectorsList(directorDtoList), ...buildCorporateDirectorsList(directorDtoList)]);
    console.log("************Director LIST")
    console.log(directorList[0])
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    let paginatedDirectorsList: OfficerCard[] = [];
    let paginationElement: PaginationData | undefined = undefined;
    if (directorList.length !== 0) {
      // Get current page number
      let page = req.query["page"];
      const pageNumber = isNaN(Number(page)) ? 1 : Number(page);

      // Get list of directors to show on current page
      const objectsPerPage = 5;
      const startIndex = (pageNumber - 1) * objectsPerPage;
      const endIndex = startIndex + objectsPerPage;
      paginatedDirectorsList = directorList.slice(startIndex, endIndex);

      // Create pagination element to navigate pages
      const numOfPages = Math.ceil(directorList.length / objectsPerPage);
      paginationElement = buildPaginationElement(
        pageNumber,
        numOfPages,
        urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req)
      );
    }

    // Enable the update button if feature is enabled
    let updateEnabled = '""';
    if(isActiveFeature(CH01_ACTIVE)) {
      updateEnabled = "true";
    }

    return res.render(Templates.ACTIVE_DIRECTORS, {
      ap01Active: isActiveFeature(AP01_ACTIVE),
      PIWIK_REMOVE_DIRECTOR_START_GOAL_ID,
      PIWIK_APPOINT_DIRECTOR_START_GOAL_ID,
      PIWIK_UPDATE_DIRECTOR_START_GOAL_ID,
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: getConfirmCompanyUrl(companyNumber),
      directorsList: paginatedDirectorsList,
      company: companyProfile,
      pagination: paginationElement,
      updateEnabled: updateEnabled,
      publicCompany: allowedPublicCompanyTypes.includes(companyProfile.type),
      ...getLocaleInfo(locales, lang),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const lang = selectLang(req.query.lang);
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const session: Session = req.session as Session;
  
  const removeAppointmentId = req.body.removeAppointmentId;
  if (removeAppointmentId) {
    return beginTerminationJourney(req, res, session, companyNumber, transactionId, removeAppointmentId);
  }

  const updateAppointmentId = req.body.updateAppointmentId;
  if (updateAppointmentId) {
    return beginUpdateJourney(req, res, session, companyNumber, transactionId, updateAppointmentId);
  }

  return beginAppointmentJourney(req, res, session, transactionId, lang);
};

/**
 * Post an officer filing and redirect to the first page in the TM01 journey.
*/
async function beginTerminationJourney(req: Request, res: Response, session: Session, companyNumber: string, transactionId: string, appointmentId: any) {
  logger.debug(`Creating a termination filing for appointment ${appointmentId}`);

  const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
  const officerFiling: OfficerFiling = {
    referenceAppointmentId: appointmentId,
    referenceEtag: appointment.etag
  };
  const filingResponse = await postOfficerFiling(session, transactionId, officerFiling);
  req.params[urlParams.PARAM_SUBMISSION_ID] = filingResponse.id;
  
  const nextPageUrl = urlUtils.getUrlToPath(DATE_DIRECTOR_REMOVED_PATH, req);
  return res.redirect(nextPageUrl);
}

/**
 * Post an officer filing and redirect to the first page in the CH01 journey.
*/
async function beginUpdateJourney(req: Request, res: Response, session: Session, companyNumber: string, transactionId: string, appointmentId: any) {
  logger.debug(`Creating an update filing for appointment ${appointmentId}`);
  const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
  console.log("************ APPOINTMENT ID")
  console.log(appointmentId)
  console.log("************ APPOINTMENT")
  console.log(appointment)
  console.log("************ TITLE")
  console.log(appointment.title)
  const nationalities = appointment.nationality?.split(",");

  const officerFiling: OfficerFiling = {
    referenceAppointmentId: appointmentId,
    referenceEtag: appointment.etag,
    //title: appointment.title,
    firstName: appointment.forename,
    middleNames: appointment.otherForenames,
    lastName: appointment.surname,
    formerNames: appointment.formerNames?.map(formerName => formerName.forenames + " " + formerName.surname).join(", "),
    dateOfBirth: appointment.dateOfBirth?.year + "-" + appointment.dateOfBirth?.month?.toString().padStart(2, '0') + "-" + appointment.dateOfBirth?.day?.toString().padStart(2, '0'),
    appointedOn: appointment.appointedOn? appointment.appointedOn: appointment.appointedBefore,
    occupation: appointment.occupation,
    nationality1: nationalities && nationalities?.length > 0? nationalities[0]: "",
    nationality2: nationalities && nationalities?.length > 1? nationalities[1]: "",
    nationality3: nationalities && nationalities?.length > 2? nationalities[2]: "",
    serviceAddress: {
      premises: appointment.serviceAddress?.premises,
      addressLine1: appointment.serviceAddress?.addressLine1,
      addressLine2: appointment.serviceAddress?.addressLine2,
      locality: appointment.serviceAddress?.locality,
      region: appointment.serviceAddress?.region,
      country: appointment.serviceAddress?.country,
      postalCode: appointment.serviceAddress?.postalCode
    },
    residentialAddress: {
      premises: appointment.usualResidentialAddress?.premises,
      addressLine1: appointment.usualResidentialAddress?.addressLine1,
      addressLine2: appointment.usualResidentialAddress?.addressLine2,
      locality: appointment.usualResidentialAddress?.locality,
      region: appointment.usualResidentialAddress?.region,
      country: appointment.usualResidentialAddress?.country,
      postalCode: appointment.usualResidentialAddress?.postalCode
    },
    nameHasBeenUpdated: false,
    nationalityHasBeenUpdated: false,
    occupationHasBeenUpdated: false,
    correspondenceAddressHasBeenUpdated: false,
    residentialAddressHasBeenUpdated: false,
  };
  const filingResponse = await postOfficerFiling(session, transactionId, officerFiling);
  req.params[urlParams.PARAM_SUBMISSION_ID] = filingResponse.id;
  
  const nextPageUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req);
  return res.redirect(nextPageUrl);
}

/**
 * Post an officer filing and redirect to the first page in the AP01 journey.
*/
async function beginAppointmentJourney(req: Request, res: Response, session: Session, transactionId: string, lang: string | undefined) {
  logger.debug(`Creating an appointment filing`);
  const officerFiling: OfficerFiling = {};
  const filingResponse = await postOfficerFiling(session, transactionId, officerFiling);
  req.params[urlParams.PARAM_SUBMISSION_ID] = filingResponse.id;
  
  const nextPageUrl = addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req), lang);
  return res.redirect(nextPageUrl);
}

const buildIndividualDirectorsList = (officers: CompanyOfficer[]): any[] => {
  console.log("OFFICER LIST")
  console.log(officers[0])
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