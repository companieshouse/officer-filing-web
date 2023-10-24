import { NextFunction, Request, Response } from "express";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END, 
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH, } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { formatValidationErrors } from '../validation/validation';
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { DirectorField } from "../model/director.model";
import { getField, setRedirectLink } from "../utils/web";
import { buildValidationErrors } from "../validation/protected.details.validation";

import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    let returnPageUrl = getBackLinkUrl(req, officerFiling);

    return res.render(Templates.DIRECTOR_PROTECTED_DETAILS, {
      templateName: Templates.DIRECTOR_PROTECTED_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(returnPageUrl, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      protected_details: calculateProtectedDetailsRadioFromFiling(officerFiling.directorAppliedToProtectDetails),
    });
  } catch (e) {
    return next(e);
  }
};

const  getBackLinkUrl = (req: Request, officerFiling: OfficerFiling) => {
  let returnPageUrl = officerFiling.protectedDetailsBackLink;
  if (returnPageUrl?.includes(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END)) {
    return urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req);
  } else if (returnPageUrl?.includes(DIRECTOR_RESIDENTIAL_ADDRESS_PATH)) {
    return urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req);
  } else {
    return urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req);
  }
}

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    let returnPageUrl = getBackLinkUrl(req, officerFiling);

    // Patch filing with updated information
    const officerFilingBody: OfficerFiling = {
      directorAppliedToProtectDetails: directorAppliedToProtectDetailsValue(req),
    };
    const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_PROTECTED_DETAILS, {
        templateName: Templates.DIRECTOR_PROTECTED_DETAILS,
        backLinkUrl: urlUtils.getUrlToPath(returnPageUrl, req),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(patchFiling.data)),
        errors: formattedErrors,
        director_address: directorAppliedToProtectDetailsValue(req),
      });
    }

    const nextPageUrl = urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req);
    return res.redirect(await setRedirectLink(req, patchFiling.data.checkYourAnswersLink, nextPageUrl));
  } catch (e) {
    next(e);
  }
}

const calculateProtectedDetailsRadioFromFiling = (directorAppliedToProtectDetails: boolean | undefined): string | undefined => {
  if (directorAppliedToProtectDetails === null) {
    return undefined;
  }
  if (directorAppliedToProtectDetails === true) {
    return DirectorField.PROTECTED_DETAILS_YES;
  }
  if (directorAppliedToProtectDetails === false) {
    return DirectorField.PROTECTED_DETAILS_NO;
  }
}

export const directorAppliedToProtectDetailsValue = (req: Request): boolean|undefined => {
  let directorProtectedDetailsRadio = getField(req, DirectorField.PROTECTED_DETAILS_RADIO);

  if (!directorProtectedDetailsRadio) {
    return undefined;
  } 
  if (directorProtectedDetailsRadio == DirectorField.PROTECTED_DETAILS_YES) {
    return true;
  }
  if (directorProtectedDetailsRadio == DirectorField.PROTECTED_DETAILS_NO) {
    return false;
  }
  return undefined;
}
