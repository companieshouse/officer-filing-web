import { NextFunction, Request, Response } from "express";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../utils/properties";
import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../model/director.model";
import { formatValidationErrors } from "../validation/validation";
import { ValidationError } from "../model/validation.model";
import { getUKAddressesFromPostcode } from "../services/postcode.lookup.service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { validatePostcode } from "../validation/postcode.validation";
import { PostcodeValidation, PremiseValidation, ResidentialManualAddressValidation } from "../validation/address.validation.config";
import { validateUKPostcode } from "../validation/uk.postcode.validation";
import { validatePremise } from "../validation/premise.validation";
import { getCountryFromKey } from "../utils/web";
import { validateManualAddress } from "../validation/manual.address.validation";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../services/company.profile.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH,
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
      backLinkUrl: await getBackLink(req, companyNumber),
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
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const originalOfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const residentialPostalCode : string = (req.body[DirectorField.POSTCODE])?.trim().toUpperCase();
    const residentialPremise : string = (req.body[DirectorField.PREMISES])?.trim();
    let jsValidationErrors = validatePostcode(residentialPostalCode, PostcodeValidation);
    if(residentialPremise) {
      jsValidationErrors = validatePremise(residentialPremise, PremiseValidation, jsValidationErrors);
    }

    const prepareOfficerFiling: OfficerFiling = { ...originalOfficerFiling,
      residentialAddress: {"premises": residentialPremise,
                           "addressLine1": "",
                           "locality": "",
                           "postalCode": residentialPostalCode,
                           "country" : ""}
      };

    // Validate formatting errors for fields, render errors if found.
    if(jsValidationErrors.length > 0) {
      return await renderPage(res, req, prepareOfficerFiling, companyNumber, jsValidationErrors);
    }

    // Validate postcode field for UK postcode, render errors if postcode not found.
    const jsUKPostcodeValidationErrors = await validateUKPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, residentialPostalCode.replace(/\s/g,''), PostcodeValidation, jsValidationErrors) ;
    if(jsUKPostcodeValidationErrors.length > 0) {
      return await renderPage(res, req, prepareOfficerFiling, companyNumber, jsValidationErrors);
    }

    // Patch the filing with updated information
    await patchOfficerFiling(session, transactionId, submissionId, prepareOfficerFiling);

    // Look up the addresses, as by now validated postcode is valid and exist
    const ukAddresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, residentialPostalCode.replace(/\s/g,''));
    // If premises is entered by user, loop through addresses to find user entered premise
    if(residentialPremise) {
      for(const ukAddress of ukAddresses) {
        if(ukAddress.premise.toUpperCase() === residentialPremise.toUpperCase()) {
          const officerFiling: OfficerFiling = {
            residentialAddress: {"premises": ukAddress.premise,
              "addressLine1": ukAddress.addressLine1,
              "addressLine2": ukAddress.addressLine2,
              "locality": ukAddress.postTown,
              "postalCode": ukAddress.postcode,
              "country" : getCountryFromKey(ukAddress.country)}
          };
          // Patch filing with updated information
          await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
          const nextPageUrlForConfirm = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req);
          return res.redirect(nextPageUrlForConfirm);
        }
      }
    }

    // Redirect user to choose addresses if premises not supplied or not found in addresses array
    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, req);
    return res.redirect(nextPageUrl);

  }
  catch (e) {
    return next(e);
  }
};

const renderPage = async (res: Response, req: Request, officerFiling : OfficerFiling, companyNumber: string, validationErrors: ValidationError[]) => {
  return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, {
    templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH,
    enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
    backLinkUrl: await getBackLink(req, companyNumber),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    postcode: officerFiling.residentialAddress?.postalCode,
    premises: officerFiling.residentialAddress?.premises,
    errors: formatValidationErrors(validationErrors),
  });
};

const getBackLink = async (req: Request, companyNumber: string) => {
  const companyProfile = await getCompanyProfile(companyNumber);
  const registeredOfficeAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
  if (registeredOfficeAddress === undefined) {
    return urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req);
  }
  const registeredOfficeAddressAsCorrespondenceAddressErrors = validateManualAddress(registeredOfficeAddress, ResidentialManualAddressValidation);
  if (registeredOfficeAddressAsCorrespondenceAddressErrors.length !== 0) {
    return urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req);
  }
  return urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req);
};
