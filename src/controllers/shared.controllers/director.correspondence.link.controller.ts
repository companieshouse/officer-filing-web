import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { createValidationErrorBasic, formatValidationErrors } from '../../validation/validation';
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../../utils/format";
import { DirectorField } from "../../model/director.model";
import { getField } from "../../utils/web";
import { Session } from "@companieshouse/node-session-handler";
import { selectLang, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { saToRoaErrorMessageKey } from "../../utils/api.enumerations.keys";

export const getCorrespondenceLink = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const locales = getLocalesService();
    const lang = selectLang(req.query.lang);

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    return res.render(templateName,{
      templateName: templateName,
      backLinkUrl: urlUtils.getUrlToPath(backUrlPath, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      ...getLocaleInfo(locales, lang),
      currentUrl: req.originalUrl,
      sa_to_roa: calculateSaToRoaRadioFromFiling(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress),
    });
  } catch (e) {
    return next(e);
  }
};

export const postCorrespondenceLink = async (req: Request, res: Response, next: NextFunction, templateName: string, nextPageOnYesUrl: string, nextPageOnNoUrl: string, backUrlPath: string) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const isServiceAddressSameAsRegisteredOfficeAddress = calculateSaToRoaBooleanValue(req);
    const locales = getLocalesService();
    const lang = selectLang(req.query.lang);

    if (isServiceAddressSameAsRegisteredOfficeAddress === undefined) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const linkError = createValidationErrorBasic(saToRoaErrorMessageKey.SA_TO_ROA_ERROR, DirectorField.SA_TO_ROA_RADIO);
      return res.render(templateName,{
        templateName: templateName,
        ...getLocaleInfo(locales, lang),
        currentUrl: req.originalUrl,
        backLinkUrl: urlUtils.getUrlToPath(backUrlPath, req),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        errors: formatValidationErrors([linkError], lang)
      });
    }

    const officerFilingBody: OfficerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: isServiceAddressSameAsRegisteredOfficeAddress
    };
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    if (isServiceAddressSameAsRegisteredOfficeAddress === true) {
      return res.redirect(urlUtils.getUrlToPath(nextPageOnYesUrl, req));
    } else {
      return res.redirect(urlUtils.getUrlToPath(nextPageOnNoUrl, req));
    }
  } catch (e) {
    next(e);
  }
}

const calculateSaToRoaRadioFromFiling = (saToRoa: boolean | undefined): string | undefined => {
  if (saToRoa === null) {
    return undefined;
  }
  if (saToRoa === true) {
    return DirectorField.SA_TO_ROA_YES;
  }
  if (saToRoa === false) {
    return DirectorField.SA_TO_ROA_NO;
  }
}

export const calculateSaToRoaBooleanValue = (req: Request): boolean|undefined => {
  let saToRoaRadio = getField(req, DirectorField.SA_TO_ROA_RADIO);

  if (!saToRoaRadio) {
    return undefined;
  } 
  if (saToRoaRadio == DirectorField.SA_TO_ROA_YES) {
    return true;
  }
  if (saToRoaRadio == DirectorField.SA_TO_ROA_NO) {
    return false;
  }
  return undefined;
}
