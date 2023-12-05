import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls";
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
import { urlUtilsRequestParams } from "./director.residential.address.controller";
import { validateRegisteredAddressComplete } from "../validation/address.validation";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { officerFiling, companyProfile } = await urlUtilsRequestParams(req);
    const isRegisteredAddressComplete  = validateRegisteredAddressComplete(companyProfile.registeredOfficeAddress);
    
    return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, {
      templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      sa_to_roa: calculateSaToRoaRadioFromFiling(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress),
      isRegisteredAddressComplete
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
    const { officerFiling, companyProfile } = await urlUtilsRequestParams(req);
    const isRegisteredAddressComplete  = validateRegisteredAddressComplete(companyProfile.registeredOfficeAddress);
    
    if (!isRegisteredAddressComplete && !isServiceAddressSameAsRegisteredOfficeAddress) {
      throw new Error("Can't use registered office address for correspondence address unless linking to it");
    }

    if (isServiceAddressSameAsRegisteredOfficeAddress === undefined) {
      const linkError = createValidationErrorBasic(SA_TO_ROA_ERROR, DirectorField.SA_TO_ROA_RADIO);
      return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, {
        templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK,
        backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        errors: formatValidationErrors([linkError])
      });
    }

    const officerFilingBody: OfficerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: isServiceAddressSameAsRegisteredOfficeAddress

    };
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    return res.redirect(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req));
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
