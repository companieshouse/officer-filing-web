import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_NATIONALITY_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { OCCUPATION_LIST } from "../utils/properties";
import { Session } from "@companieshouse/node-session-handler";
import { OfficerFiling, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../model/director.model";
import { getField, setBackLink, setRedirectLink } from "../utils/web";
import { logger } from "../utils/logger";
import { ValidationError } from "../model/validation.model";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { validateOccupation } from "../validation/occupation.validation";
import { OccupationValidation } from "../validation/occupation.validation.config";
import {
  createValidationErrorBasic,
  formatValidationErrors,
  mapValidationResponseToAllowedErrorKey
} from "../validation/validation";
import { occupationErrorMessageKey } from "../utils/api.enumerations.keys";
import { getValidationStatus } from "../services/validation.status.service";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(Templates.DIRECTOR_OCCUPATION, {
      templateName: Templates.DIRECTOR_OCCUPATION,
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req)),
      optionalBackLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink),
      typeahead_array: OCCUPATION_LIST,
      typeahead_value: officerFiling.occupation,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling))
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
  const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

  const occupation = getField(req, DirectorField.OCCUPATION);
  const frontendValidationErrors = validateOccupation(occupation, OccupationValidation);

  // render validation errors
  if(frontendValidationErrors) {
    return renderPage(res, req, officerFiling, [frontendValidationErrors], occupation);
  }

  // patch the filing with occupation when no front end validation errors encountered.
  logger.debug(`Patching officer filing with occupation ` + occupation);
  const patchedOccupationFiling: OfficerFiling = {
    occupation: occupation
  };
  const patchedFiling = await patchOfficerFiling(session, transactionId, submissionId, patchedOccupationFiling);
  const validationStatus = await getValidationStatus(session, transactionId, submissionId);
  const backendValidationErrors = buildValidationErrors(validationStatus);

  // render backend validation errors
  if (backendValidationErrors.length > 0) {
    return renderPage(res, req, patchedFiling.data, backendValidationErrors, occupation);
  }

  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req);
  return res.redirect(await setRedirectLink(req, patchedFiling.data.checkYourAnswersLink, nextPageUrl));
  } catch (e) {
    return next(e);
  }
};

export const renderPage = (res: Response, req: Request, officerFiling: OfficerFiling, validationErrors: ValidationError[], occupation: string) => {
  const formattedErrors = formatValidationErrors(validationErrors);
  return res.render(Templates.DIRECTOR_OCCUPATION, {
    templateName: Templates.DIRECTOR_OCCUPATION,
    backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req)),
    typeahead_array: OCCUPATION_LIST,
    typeahead_value: occupation,
    errors: formattedErrors,
    typeahead_errors: JSON.stringify(formattedErrors),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling))
  });
}

/**
 * Build a list of error objects that will be displayed on the page, based on the result from getValidation.
 * Only certain relevant errors to do with the elements on the page will be returned, others will be ignored.
 * There is some more complex logic around previous names with some JS validation
 *
 * @param validationStatusResponse Response from running getValidation. Contains the api validation messages
 * @returns A list of ValidationError objects that contain the messages and info to display on the page
 */
export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  // Occupation
  var occupationKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, occupationErrorMessageKey);
  if (occupationKey) {
    validationErrors.push(createValidationErrorBasic(occupationKey, DirectorField.OCCUPATION));
  }

  return validationErrors;
}