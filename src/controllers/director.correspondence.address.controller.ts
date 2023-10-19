import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, DIRECTOR_OCCUPATION_PATH, 
        DIRECTOR_OCCUPATION_PATH_END, 
        DIRECTOR_PROTECTED_DETAILS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { createValidationErrorBasic, formatValidationErrors } from "../validation/validation";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { ValidationError } from "../model/validation.model";
import { whereDirectorLiveCorrespondenceErrorMessageKey } from "../utils/api.enumerations.keys";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile, RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

const directorChoiceHtmlField: string = "director_correspondence_address";
const directorCorrespondenceAddressRadioChoiceMap = new Map();

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const companyProfile = await getCompanyProfile(companyNumber);

    if (req.headers.referer?.includes(DIRECTOR_OCCUPATION_PATH_END)){
      directorCorrespondenceAddressRadioChoiceMap.clear();
    }

    return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, {
      templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req),
      director_correspondence_address: directorCorrespondenceAddressRadioChoiceMap.get("correspondence_choice"),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      directorRegisteredOfficeAddress: formatDirectorRegisteredAddress(companyProfile),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const selectedSraAddressChoice = req.body[directorChoiceHtmlField];
    directorCorrespondenceAddressRadioChoiceMap.set("correspondence_choice", selectedSraAddressChoice);

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const companyProfile = await getCompanyProfile(companyNumber);

    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, {
        templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS,
        backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req),
        errors: formattedErrors,
        director_correspondence_address: directorCorrespondenceAddressRadioChoiceMap.get("correspondence_choice"),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        directorRegisteredOfficeAddress: formatDirectorRegisteredAddress(companyProfile),
      });
    }

    const officerFilingBody: OfficerFiling = {};
    let nextPageUrl = "";
    if (selectedSraAddressChoice === "director_registered_office_address") {
      officerFilingBody.serviceAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req); //expected to go to linking page (yet to be done)
      return res.redirect(nextPageUrl);
    } else {
      nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req);
      return res.redirect(nextPageUrl);
    }
  } catch(e) {
    next(e);
  }
};

const mapCompanyProfileToOfficerFilingAddress = (registeredOffice: RegisteredOfficeAddress) => {
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
    validationErrors.push(createValidationErrorBasic(whereDirectorLiveCorrespondenceErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED, directorChoiceHtmlField));
  }
  return validationErrors;
};

const formatDirectorRegisteredAddress = (companyProfile: CompanyProfile) => {
  return `
          ${companyProfile.registeredOfficeAddress?.addressLineOne}, 
          ${companyProfile.registeredOfficeAddress?.locality},
          ${companyProfile.registeredOfficeAddress?.region} 
          ${companyProfile.registeredOfficeAddress?.postalCode}
        `
 }
