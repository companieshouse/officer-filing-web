import { NextFunction, Request, Response } from "express";
import { DIRECTOR_DATE_DETAILS_PATH, DIRECTOR_OCCUPATION_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { OfficerFiling, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getField, setBackLink, setRedirectLink } from "../utils/web";
import { DirectorField } from "../model/director.model";
import { getValidationStatus } from "../services/validation.status.service";
import { createValidationErrorBasic, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { ValidationError } from "../model/validation.model";
import { nationalityErrorMessageKey, nationalityOneErrorMessageKey, nationalityThreeErrorMessageKey, nationalityTwoErrorMessageKey } from "../utils/api.enumerations.keys";
import { NATIONALITY_LIST } from "../utils/properties";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(Templates.DIRECTOR_NATIONALITY, {
      templateName: Templates.DIRECTOR_NATIONALITY,
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req)),
      optionalBackLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req)),
      typeahead_array: NATIONALITY_LIST + "|" + NATIONALITY_LIST + "|" + NATIONALITY_LIST,
      typeahead_value: officerFiling.nationality1 + "|" + officerFiling.nationality2 + "|" + officerFiling.nationality3,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      nationality2_hidden: officerFiling.nationality2Link,
      nationality3_hidden: officerFiling.nationality3Link
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
    // Patch filing with updated information
    const officerFiling: OfficerFiling = {
      nationality1: getField(req, DirectorField.NATIONALITY_1),
      nationality2: getField(req, DirectorField.NATIONALITY_2),
      nationality3: getField(req, DirectorField.NATIONALITY_3),
      nationality2Link: getField(req, DirectorField.NATIONALITY_2_RADIO),
      nationality3Link: getField(req, DirectorField.NATIONALITY_3_RADIO)
    };
    console.log("Patching officer filing" + JSON.stringify(req.body))
    const patchedFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    const validationErrors = buildValidationErrors(validationStatus, officerFiling);

    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_NATIONALITY, {
        templateName: Templates.DIRECTOR_NATIONALITY,
        // backLinkUrl: setBackLink(req, patchedFiling.data.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req)),
        typeahead_array: NATIONALITY_LIST + "|" + NATIONALITY_LIST + "|" + NATIONALITY_LIST,
        typeahead_value: officerFiling.nationality1 + "|" + officerFiling.nationality2 + "|" + officerFiling.nationality3,
        errors: formattedErrors,
        typeahead_errors: JSON.stringify(formattedErrors),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(patchedFiling.data)),
        nationality2_hidden: officerFiling.nationality2Link,
        nationality3_hidden: officerFiling.nationality3Link
      });
    }
    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req);
    return res.redirect(await setRedirectLink(req, patchedFiling.data.checkYourAnswersLink, nextPageUrl));
  } catch (e) {
    return next(e);
  }
  };

export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse, officerFiling: OfficerFiling): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  const nationalityList = NATIONALITY_LIST.split(";");
  // Nationality
  // If nationality is invalid, raise error for that field. Otherwise raise errors as returned by the API.
  if (officerFiling.nationality1 && !nationalityList.includes(officerFiling.nationality1)) {
    validationErrors.push(createValidationErrorBasic(nationalityErrorMessageKey.NATIONALITY_INVALID, DirectorField.NATIONALITY_1));
  }
  else {
    var nationalityOneKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, nationalityOneErrorMessageKey);
    if (nationalityOneKey) {
      validationErrors.push(createValidationErrorBasic(nationalityOneKey, DirectorField.NATIONALITY_1));
    }
  }
  if (officerFiling.nationality2 && !nationalityList.includes(officerFiling.nationality2)) {
    validationErrors.push(createValidationErrorBasic(nationalityErrorMessageKey.NATIONALITY_INVALID, DirectorField.NATIONALITY_2));
  }
  else {
    var nationalityTwoKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, nationalityTwoErrorMessageKey);
    if (nationalityTwoKey) {
      validationErrors.push(createValidationErrorBasic(nationalityTwoKey, DirectorField.NATIONALITY_2));
    }
  }
  if (officerFiling.nationality3 && !nationalityList.includes(officerFiling.nationality3)) {
    validationErrors.push(createValidationErrorBasic(nationalityErrorMessageKey.NATIONALITY_INVALID, DirectorField.NATIONALITY_3));
  }
  else {
    var nationalityThreeKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, nationalityThreeErrorMessageKey);
    if (nationalityThreeKey) {
      validationErrors.push(createValidationErrorBasic(nationalityThreeKey, DirectorField.NATIONALITY_3));
    }
  }

  return validationErrors;
}
 
