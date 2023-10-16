import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_PROTECTED_DETAILS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { whereDirectorLiveResidentialErrorMessageKey } from '../utils/api.enumerations.keys';
import { createValidationErrorBasic, formatValidationErrors } from '../validation/validation';
import { ValidationError } from "../model/validation.model";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

const directorChoiceHtmlField: string = "director_address";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req),
      director_address: session.getExtraData("director_address_choice"),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    });
  } catch (e) {
    next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const selectedSraAddressChoice = req.body[directorChoiceHtmlField];
    session.setExtraData("director_address_choice", selectedSraAddressChoice);

    const officerFiling: OfficerFiling = {
      //field to be retrieved
    }

    const patchedFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFiling);

    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
        templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS,
        backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req),
        errors: formattedErrors,
        director_address: session.getExtraData("director_address_choice"),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(patchedFiling.data)),
      });
    }

    let nextPageUrl = "";
    if (selectedSraAddressChoice === "director_service_address") {
      nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req);
      return res.redirect(nextPageUrl);
    } 

    nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req);
    return res.redirect(nextPageUrl);
    
  } catch (e) {
    next(e);
  }
};

export const buildValidationErrors = (req: Request): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  if (req.body[directorChoiceHtmlField] === undefined) {
    validationErrors.push(createValidationErrorBasic(whereDirectorLiveResidentialErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED, directorChoiceHtmlField));
  }
  return validationErrors;
};