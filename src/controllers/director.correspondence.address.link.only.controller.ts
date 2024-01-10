import { NextFunction, Request, Response } from "express";
import { 
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { createValidationErrorBasic, formatValidationErrors } from '../validation/validation';
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { DirectorField } from "../model/director.model";
import { Session } from "@companieshouse/node-session-handler";
import { SA_TO_ROA_ERROR } from "../utils/constants";
import { urlUtilsRequestParams } from "./director.residential.address.controller";
import { validateRegisteredAddressComplete } from "../validation/address.validation";
import { calculateSaToRoaRadioFromFiling,  calculateSaToRoaBooleanValue } from "./director.correspondence.address.link.controller";
import { logger } from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { officerFiling, companyProfile } = await urlUtilsRequestParams(req);
    const isRegisteredAddressComplete  = validateRegisteredAddressComplete(companyProfile.registeredOfficeAddress);
    
    return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_ONLY, getPageOptions(req, officerFiling, companyProfile, isRegisteredAddressComplete));
  } catch (e) {
    return next(e);
  }
};

const getPageOptions = (req, officerFiling, companyProfile, isRegisteredAddressComplete) => { 
  return {
    templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_ONLY,
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    sa_to_roa: calculateSaToRoaRadioFromFiling(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress),
    isRegisteredAddressComplete
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const linkOnly = calculateSaToRoaBooleanValue(req);
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    
    if (linkOnly === undefined) {
      const linkError = createValidationErrorBasic(SA_TO_ROA_ERROR, DirectorField.SA_TO_ROA_RADIO);
      return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_ONLY, {
        templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_ONLY,
        backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        errors: formatValidationErrors([linkError])
      });
    }

    const officerFilingBody: OfficerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: linkOnly,
      serviceAddress: undefined
    };
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    if (linkOnly) {
      logger.info(`Director correspondence address link only selected for transaction: ${transactionId}`);
      return res.redirect(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req));
    } else {
      return res.redirect(urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req));
    }
    
  } catch (e) {
    next(e);
  }
};