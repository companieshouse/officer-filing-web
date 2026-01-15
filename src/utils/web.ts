import { Request } from "express";
import { urlUtils } from "./url";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END, UPDATE_DIRECTOR_CHECK_ANSWERS_END, UPDATE_DIRECTOR_CHECK_ANSWERS_PATH } from "../types/page.urls";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromAppointment, retrieveDirectorNameFromFiling } from "./format";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";
import { addLangToUrl } from './localise';
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";

/**
 * Get field from the form. If the field is populated then it will be returned, else empty string
 */
export const getField = (req: Request, fieldName: string): string => {
  const field: string = req.body[fieldName];
  if (field && field.trim().length > 0) {
    return field;
  }
  return "";
};

/**
 * Set the back link for a page. 
 * Checks whether the user came from the check your answers page and if so,
 *  sets the back link to the check your answers page instead.
 */
export const setBackLink = (req: Request, checkYourAnswersLink: string | undefined, backLink: string, lang?: string): string => {
  if(checkYourAnswersLink){
    return addLangToUrl(checkYourAnswersLink, lang);
  }
  return addLangToUrl(backLink, lang);
};

/**
 * Set the redirect link for a page. 
 * Checks whether the user came from the check your answers page and if so,
 *  sets the redirect link to the check your answers page instead.
 */
export const setRedirectLink = async (req: Request, checkYourAnswersLink: string | undefined, redirectLink: string, lang?: string): Promise<string> => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session: Session = req.session as Session;

  if(checkYourAnswersLink){
    const officerFiling: OfficerFiling = {
      checkYourAnswersLink: ""
    };
    await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
    const regexAppointCYACheck = new RegExp(`${APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END}(\\?.*)?`);
    const regexUpdateCYACheck = new RegExp(`${UPDATE_DIRECTOR_CHECK_ANSWERS_END}(\\?.*)?`);

    if (regexAppointCYACheck.test(checkYourAnswersLink)) {
      return addLangToUrl(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req), lang);
    } else if (regexUpdateCYACheck.test(checkYourAnswersLink)) {
      return addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, req), lang);
    }
  }
  return redirectLink;
}

/**
 * Map the country key returned by postcode lookup to a readable format
 */
export const getCountryFromKey = (country: string): string => {
  const countryKeyValueMap: Record<string, string> = {
    'GB-SCT': 'Scotland',
    'GB-WLS': 'Wales',
    'GB-ENG': 'England',
    'GB-NIR': 'Northern Ireland',
    'Channel Island': 'Channel Island',
    'Isle of Man': 'Isle of Man',
  };
  return countryKeyValueMap[country];
}

/**
 * Set the directors' name based on AP01 journey
 */
export const getDirectorNameForAppointJourney = async (officerFiling: OfficerFiling): Promise<string> => {
  return retrieveDirectorNameFromFiling(officerFiling)
}

/**
 * Set the directors' name based on CH01 journey
 */
export const getDirectorNameForUpdateJourney = async (session: Session, req: Request, officerFiling: OfficerFiling): Promise<string> => {
  const companyAppointment = await getCompanyAppointmentFullRecord(session, urlUtils.getCompanyNumberFromRequestParams(req), officerFiling.referenceAppointmentId as string);
  return retrieveDirectorNameFromAppointment(companyAppointment)
}

/**
 * Get the formatted addresses for the array pages
 * @param ukAddresses
 */
export const getAddressOptions = (ukAddresses: UKAddress[]) => {
  return ukAddresses.map((address: UKAddress) => {
    return {
      premises: address.premise,
      formattedAddress: formatTitleCase(address.premise + " " + address.addressLine1 + (address.addressLine2 ? ", " + address.addressLine2 : "") + ", " + address.postTown + ", " + getCountryFromKey(address.country)) + ", " + address.postcode
    };
  });
}

/**
 * Adds the check your answers backlink parameter to the link
 * @param url 
 * @returns 
 */

export const addCheckYourAnswersParamToLink = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return url + separator + "cya_backlink=true";
};