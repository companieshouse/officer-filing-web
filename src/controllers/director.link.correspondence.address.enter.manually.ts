import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, DIRECTOR_RESIDENTIAL_ADDRESS_PATH} from "../types/page.urls";
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
import { SA_TO_ROA_ERROR } from "../utils/constants";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    return res.render(Templates.DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, {
      templateName: Templates.DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
      currentUrl: urlUtils.getUrlToPath(DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      sa_to_roa: calculateSaToRoaRadioFromFiling(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress),
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
    const isServiceAddressSameAsRegisteredOfficeAddress = calculateSaToRoaBooleanValue(req);


    if (isServiceAddressSameAsRegisteredOfficeAddress === undefined) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const linkError = createValidationErrorBasic(SA_TO_ROA_ERROR, DirectorField.SA_TO_ROA_RADIO);
      return res.render(Templates.DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, {
        templateName: Templates.DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY,
        backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        errors: formatValidationErrors([linkError])
      });
    }

    const officerFilingBody: OfficerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: isServiceAddressSameAsRegisteredOfficeAddress

    };
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

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
