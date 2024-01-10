import { NextFunction, Request, Response } from "express";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_PROTECTED_DETAILS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { createValidationErrorBasic, formatValidationErrors } from '../validation/validation';
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { DirectorField } from "../model/director.model";
import { getField } from "../utils/web";
import { Session } from "@companieshouse/node-session-handler";
import { HA_TO_SA_ERROR } from "../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_LINK, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_LINK,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      ha_to_sa: calculateHaToSaRadioFromFiling(officerFiling.isHomeAddressSameAsServiceAddress),
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
    const isHomeAddressSameAsServiceAddress = calculateHaToSaBooleanValue(req);
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    
    if (isHomeAddressSameAsServiceAddress === undefined) {
      const linkError = createValidationErrorBasic(HA_TO_SA_ERROR, DirectorField.HA_TO_SA_RADIO);
      return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_LINK, {
        templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_LINK,
        backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        errors: formatValidationErrors([linkError])
      });
    }

    const officerFilingBody: OfficerFiling = {
      isHomeAddressSameAsServiceAddress: isHomeAddressSameAsServiceAddress
    };
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    if (officerFiling.checkYourAnswersLink) {
      return res.redirect(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req));
    }
    return res.redirect(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req));
  } catch (e) {
    next(e);
  }
}

const calculateHaToSaRadioFromFiling = (haToSa: boolean | undefined): string | undefined => {
  if (haToSa === null) {
    return undefined;
  }
  if (haToSa === true) {
    return DirectorField.HA_TO_SA_YES;
  }
  if (haToSa === false) {
    return DirectorField.HA_TO_SA_NO;
  }
}

export const calculateHaToSaBooleanValue = (req: Request): boolean|undefined => {
  let haToSaRadio = getField(req, DirectorField.HA_TO_SA_RADIO);

  if (!haToSaRadio) {
    return undefined;
  } 
  if (haToSaRadio == DirectorField.HA_TO_SA_YES) {
    return true;
  }
  if (haToSaRadio == DirectorField.HA_TO_SA_NO) {
    return false;
  }
  return undefined;
}
