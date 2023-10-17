import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { DirectorField } from "../model/director.model";
import { PostcodeValidation, PremiseValidation } from "../validation/address.validation.config";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { formatValidationErrors } from "../validation/validation";
import { ValidationError } from "../model/validation.model";
import { validateUKPostcode } from "../validation/uk.postcode.validation";
import { POSTCODE_ADDRESSES_LOOKUP_URL, POSTCODE_VALIDATION_URL } from "../utils/properties";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { getUKAddressesFromPostcode } from "../services/postcode.lookup.service";
import { logger } from "../utils/logger";
import { getCountryFromKey } from "../utils/country.key";
import { validatePostcode } from "../validation/postcode.validation";
import { validatePremise } from "../validation/premise.validation";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, {
      templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH,
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req),
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      postcode: officerFiling.serviceAddress?.postalCode,
      premises: officerFiling.serviceAddress?.premises
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
    const originalOfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const correspondencePostalCode : string = (req.body[DirectorField.POSTCODE])?.trim();
    const correspondencePremise : string = (req.body[DirectorField.PREMISES])?.trim();
    let jsValidationErrors = validatePostcode(correspondencePostalCode, PostcodeValidation);
    if(correspondencePremise) {
      jsValidationErrors = validatePremise(correspondencePremise, PremiseValidation, jsValidationErrors);
    }

    const prepareOfficerFiling: OfficerFiling = { ...originalOfficerFiling,
      serviceAddress: {"premises": correspondencePremise,
                       "addressLine1": "",
                       "locality": "",
                       "postalCode": correspondencePostalCode,
                       "country" : ""},
      serviceAddressBackLink: DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
    };

    // Patch the filing with updated information
    logger.debug(`Patching officer filing correspondence address with postcode ${correspondencePostalCode} and premise ${correspondencePremise}`);
    await patchOfficerFiling(session, transactionId, submissionId, prepareOfficerFiling);

    // Validate formatting errors for fields, render errors if found.
    if(jsValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors);
    }

    // Validate postcode field for UK postcode, render errors if postcode not found.
    const jsUKPostcodeValidationErrors = await validateUKPostcode(POSTCODE_VALIDATION_URL, correspondencePostalCode.replace(/\s/g,''), PostcodeValidation, jsValidationErrors) ;
    if(jsUKPostcodeValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors);
    }

    // Look up the addresses, as by now validated postcode is valid and exist
    const ukAddresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, correspondencePostalCode.replace(/\s/g,''));
    // If premises is entered by user, loop through addresses to find user entered premise
    if(correspondencePremise) {
      for(const ukAddress of ukAddresses) {
        if(ukAddress.premise.toUpperCase() === correspondencePremise.toUpperCase()) {
          const officerFiling: OfficerFiling = {
            serviceAddress: {"premises": ukAddress.premise,
              "addressLine1": ukAddress.addressLine1,
              "addressLine2": ukAddress.addressLine2,
              "locality": ukAddress.postTown,
              "postalCode": ukAddress.postcode,
              "country" : getCountryFromKey(ukAddress.country)},
            serviceAddressBackLink: DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END
          };
          // Patch filing with updated information
          await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
          const nextPageUrlForConfirm = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req);
          return res.redirect(nextPageUrlForConfirm);
        }
      }
    }

    // Redirect user to choose addresses if premises not supplied or not found in addresses array
    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, req);
    return res.redirect(nextPageUrl);

  }
  catch (e) {
    return next(e);
  }
};

const renderPage = (res: Response, req: Request, officerFiling : OfficerFiling, validationErrors: ValidationError[]) => {
  return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, {
    templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH,
    enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req),
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    postcode: officerFiling.residentialAddress?.postalCode,
    premises: officerFiling.residentialAddress?.premises,
    errors: formatValidationErrors(validationErrors)
  });
}
