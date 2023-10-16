import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, 
        DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, DIRECTOR_OCCUPATION_PATH, 
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

const directorChoiceHtmlField: string = "director_correspondence_address";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    // retrieve registered office address

    return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, {
      templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req),
      director_correspondence_address: session.getExtraData("director_correspondence_address_choice"),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      directorServiceAddress: formatDirectorServiceAddress(officerFiling),
      manualAddress: formatDirectorResidentialAddress(officerFiling)
    });
  } catch (e) {
    return next(e);
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
  try{
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
  const selectedSraAddressChoice = req.body[directorChoiceHtmlField];
  session.setExtraData("director_correspondence_address_choice", selectedSraAddressChoice);
  const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
  const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, {
        templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS,
        backLinkUrl: getBackLinkUrl(req),
        errors: formattedErrors,
        director_address: session.getExtraData("director_address_choice"),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        directorServiceAddress: formatDirectorServiceAddress(officerFiling),
        manualAddress: formatDirectorResidentialAddress(officerFiling)   
      });
    }

    const officerFilingBody: OfficerFiling = {};
    let nextPageUrl = "";
    if (selectedSraAddressChoice === "director_registered_service_address") {
      officerFilingBody.serviceAddress = officerFiling.serviceAddress;
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req); //expected to go to linking page (yet to be done)
      return res.redirect(nextPageUrl);
    } else if (selectedSraAddressChoice === "director_corresponse_manual_address") {
      officerFilingBody.residentialAddress = officerFiling.residentialAddress;
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

export const buildValidationErrors = (req: Request): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  if (req.body[directorChoiceHtmlField] === undefined) {
    validationErrors.push(createValidationErrorBasic(whereDirectorLiveCorrespondenceErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED, directorChoiceHtmlField));
  }
  return validationErrors;
};

const formatDirectorResidentialAddress = (officerFiling: OfficerFiling) => {
  return `
          ${officerFiling.residentialAddress?.addressLine1}, 
          ${officerFiling.residentialAddress?.locality},
          ${officerFiling.residentialAddress?.country} 
          ${officerFiling.residentialAddress?.postalCode} 
        `
}

const formatDirectorServiceAddress = (officerFiling: OfficerFiling) => {
  return `
          ${officerFiling.serviceAddress?.addressLine1}, 
          ${officerFiling.serviceAddress?.locality},
          ${officerFiling.serviceAddress?.country} 
          ${officerFiling.serviceAddress?.postalCode}
        `
 }
