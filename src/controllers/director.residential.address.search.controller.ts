import { NextFunction, Request, Response } from "express";
import { POSTCODE_ADDRESSES_LOOKUP_URL, POSTCODE_VALIDATION_URL} from "../utils/properties";
import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../model/director.model";
import { logger } from "../utils/logger";
import { formatValidationErrors } from "../validation/validation";
import { ValidationError } from "../model/validation.model";
import { getUKAddressesFromPostcode } from "../services/postcode.lookup.service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { validatePremiseAndPostcode } from "../validation/postcode.validation";
import { PostcodeValidation, PremiseValidation } from "../validation/address.validation.config";
import { validateUKPostcode } from "../validation/uk.postcode.validation";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH,
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      postcode: officerFiling.residentialAddress?.postalCode,
      premises: officerFiling.residentialAddress?.premises
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
    const postalCode : string = (req.body[DirectorField.POSTCODE])?.trim();
    const premise : string = (req.body[DirectorField.PREMISES])?.trim();
    const jsValidationErrors = validatePremiseAndPostcode(postalCode, PostcodeValidation, PremiseValidation, premise);

    const prepareOfficerFiling: OfficerFiling = {
      residentialAddress: {"premises": premise,
                           "addressLine1": "",
                           "locality": "",
                           "postalCode": postalCode,
                           "country" : ""},
      residentialAddressBackLink: DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END,
      };

    // Validate formatting errors for fields, render errors if found.
    if(jsValidationErrors.length > 0) {
      await patchOfficerFiling(session, transactionId, submissionId, prepareOfficerFiling);
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors);
    }

    // Validate postcode field for UK postcode, render errors if postcode not found.
    const jsUKPostcodeValidationErrors = await validateUKPostcode(POSTCODE_VALIDATION_URL, postalCode.replace(/\s/g,''), PostcodeValidation, jsValidationErrors) ;
    if(jsUKPostcodeValidationErrors.length > 0) {
      await patchOfficerFiling(session, transactionId, submissionId, prepareOfficerFiling);
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors);
    }

    // Look up the addresses, as by now validated postcode is valid and exist
    const ukAddresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postalCode.replace(/\s/g,''));
    // If premises is entered by user, loop through addresses to find user entered premise
    if(premise) {
      for(const ukAddress of ukAddresses) {
        if(ukAddress.premise.toUpperCase() === premise.toUpperCase()) {
          const officerFiling: OfficerFiling = {
            residentialAddress: {"premises": ukAddress.premise,
              "addressLine1": ukAddress.addressLine1,
              "addressLine2": ukAddress.addressLine2,
              "locality": ukAddress.postTown,
              "postalCode": ukAddress.postcode,
              "country" : getCountryFromKey(ukAddress.country)},
            residentialAddressBackLink: DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END
          };
          // Patch filing with updated information
          await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
          const nextPageUrlForConfirm = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req);
          return res.redirect(nextPageUrlForConfirm);
        }
      }
    }

    // Redirect user to choose addresses if premises not supplied or not found in addresses array
    logger.debug(`Patching officer filing with postcode ${postalCode}`);
    await patchOfficerFiling(session, transactionId, submissionId, prepareOfficerFiling);
    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, req);
    return res.redirect(nextPageUrl);

  }
  catch (e) {
    return next(e);
  }
};

export const getCountryFromKey = (country: string): string => {
  const countryKeyValueMap: Record<string, string> = {
    'GB-SCT': 'Scotland',
    'GB-WLS': 'Wales',
    'GB-ENG': 'England',
    'GB-NIR': 'Northern Ireland',
    'Channel Island': 'Channel Island',
    'Isle of Man': 'Isle of Man',
  };
  return countryKeyValueMap[country];
}

const renderPage = (res: Response, req: Request, officerFiling : OfficerFiling, validationErrors: ValidationError[]) => {
  return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, {
    templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH,
    enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    postcode: officerFiling.residentialAddress?.postalCode,
    premises: officerFiling.residentialAddress?.premises,
    errors: formatValidationErrors(validationErrors),
  });
}