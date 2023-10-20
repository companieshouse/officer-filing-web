import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, 
        DIRECTOR_PROTECTED_DETAILS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH 
      } from '../types/page.urls';
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { whereDirectorLiveErrorMessageKey } from '../utils/api.enumerations.keys';
import { createValidationErrorBasic, formatValidationErrors } from '../validation/validation';
import { ValidationError } from "../model/validation.model";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile, RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

const directorChoiceHtmlField: string = "director_address";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const companyProfile = await getCompanyProfile(companyNumber);

    return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS,
      backLinkUrl: getBackLinkUrl(req),
      director_address: officerFiling.directorResidentialAddressChoice,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      directorRegisteredOfficeAddress: formatDirectorRegisteredOfficeAddress(companyProfile),
      manualAddress: formatDirectorResidentialAddress(officerFiling)
    });
  } catch (e) {
    next(e);
  }
};
 
export const getBackLinkUrl = (req: Request): string => {
  const callerUrl = req.headers.referer;
  if (callerUrl !== undefined && callerUrl.includes(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH)) {
    return urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req);
  } else {
    return urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req);
  }
}

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;

    const selectedSraAddressChoice = req.body[directorChoiceHtmlField];
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const companyProfile = await getCompanyProfile(companyNumber);
    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
        templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS,
        backLinkUrl: getBackLinkUrl(req),
        errors: formattedErrors,
        director_address: selectedSraAddressChoice,
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        directorRegisteredOfficeAddress: formatDirectorRegisteredOfficeAddress(companyProfile),
        manualAddress: formatDirectorResidentialAddress(officerFiling)   
      });
    }

    const officerFilingBody: OfficerFiling = {
      directorResidentialAddressChoice: selectedSraAddressChoice
    };
    let nextPageUrl = "";
    if (selectedSraAddressChoice === "director_registered_office_address") {
      officerFilingBody.residentialAddress = mapRegisteredOfficeToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req);
      return res.redirect(nextPageUrl);
    } else if (selectedSraAddressChoice === "director_correspondence_address") {
      officerFilingBody.residentialAddress = officerFiling.serviceAddress;
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req); //broken as agreed with BA
      return res.redirect(nextPageUrl);
    } else {
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req);
      return res.redirect(nextPageUrl);
    }
  } catch (e) {
    next(e);
  }
};

const mapRegisteredOfficeToOfficerFilingAddress = (registeredOffice: RegisteredOfficeAddress) => {
  if (!registeredOffice) {
    return; 
  }
  return {
    addressLine1: registeredOffice.addressLineOne,
    addressLine2: registeredOffice.addressLineTwo,
    careOf: registeredOffice.careOf,
    country: registeredOffice.country,
    locality: registeredOffice.locality,
    poBox: registeredOffice.poBox,
    postalCode: registeredOffice.postalCode,
    premises: registeredOffice.premises,
    region: registeredOffice.region
  } 
}

export const buildValidationErrors = (req: Request): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  if (req.body[directorChoiceHtmlField] === undefined) {
    validationErrors.push(createValidationErrorBasic(whereDirectorLiveErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED, directorChoiceHtmlField));
  }
  return validationErrors;
};

const formatDirectorResidentialAddress = (officerFiling: OfficerFiling): string => {
  return formatTitleCase(`
          ${officerFiling.serviceAddress?.addressLine1},
          ${officerFiling.serviceAddress?.addressLine2 ? officerFiling.serviceAddress.addressLine2 : ""}
          ${officerFiling.serviceAddress?.locality},
          ${officerFiling.serviceAddress?.country} 
        `) + officerFiling.serviceAddress?.postalCode
}

const formatDirectorRegisteredOfficeAddress = (companyProfile: CompanyProfile): string => {
  return formatTitleCase(`
          ${companyProfile.registeredOfficeAddress?.addressLineOne},
          ${companyProfile.registeredOfficeAddress?.addressLineTwo ? companyProfile.registeredOfficeAddress?.addressLineTwo : ""},
          ${companyProfile.registeredOfficeAddress?.locality},
          ${companyProfile.registeredOfficeAddress?.region} 
        `) + companyProfile.registeredOfficeAddress?.postalCode
 }
