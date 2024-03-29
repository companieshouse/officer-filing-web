import { NextFunction, Request, Response } from "express";
import {
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
} from "../types/page.urls";
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
import { getLocaleInfo, getLocalesService, selectLang, addLangToUrl } from "../utils/localise";

import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    if(req.query.cya_backlink === "true") {
      officerFiling.checkYourAnswersLink = "";
           await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
    }

    return res.render(Templates.DIRECTOR_PROTECTED_DETAILS, {
      templateName: Templates.DIRECTOR_PROTECTED_DETAILS,
      backLinkUrl:  addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req), lang),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      protected_details: calculateProtectedDetailsRadioFromFiling(officerFiling.directorAppliedToProtectDetails),
      ...getLocaleInfo(locales, lang),
      currentUrl: req.originalUrl,
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
    await getOfficerFiling(session, transactionId, submissionId);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    // Patch filing with updated information
    const officerFilingBody: OfficerFiling = {
      directorAppliedToProtectDetails: directorAppliedToProtectDetailsValue(req),
    };
    const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors, lang);
      return res.render(Templates.DIRECTOR_PROTECTED_DETAILS, {
        templateName: Templates.DIRECTOR_PROTECTED_DETAILS,
        backLinkUrl:  addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req), lang),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(patchFiling.data)),
        errors: formattedErrors,
        director_address: directorAppliedToProtectDetailsValue(req),
        ...getLocaleInfo(locales, lang),
        currentUrl: req.originalUrl,
      });
    }

    const nextPageUrl = addLangToUrl(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req), lang);
    return res.redirect(await setRedirectLink(req, patchFiling.data.checkYourAnswersLink, nextPageUrl, lang));
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
