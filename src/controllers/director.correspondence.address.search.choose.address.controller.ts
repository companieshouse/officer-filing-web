import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS,
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../utils/properties";
import { getUKAddressesFromPostcode } from "../services/postcode.lookup.service";
import { DirectorField } from "../model/director.model";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { ValidationError } from "../model/validation.model";
import { createValidationError, formatValidationErrors } from "../validation/validation";
import { correspondenceAddressErrorMessageKey } from "../utils/api.enumerations.keys";
import { getCountryFromKey } from "../utils/web";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const postalCode = officerFiling?.serviceAddress?.postalCode;
    if (!postalCode) {
      throw new Error("Postal code is undefined");
    }
    const addresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postalCode.replace(/\s/g, ''));
    
    return renderPage(req, res, officerFiling, addresses, []);
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const session: Session = req.session as Session;
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

  const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
  const postalCode = officerFiling?.serviceAddress?.postalCode;
  if (!postalCode) {
    throw new Error("Postal code is undefined");
  }
  const addresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postalCode.replace(/\s/g, ''));

  const selectedPremises = req.body[DirectorField.ADDRESS_ARRAY];
  const selectedAddress = addresses.find((address: UKAddress) => address.premise === selectedPremises);
  if (!selectedAddress) {
    const validationError = createValidationError(correspondenceAddressErrorMessageKey.CORRESPONDENCE_ADDRESS_BLANK, [DirectorField.ADDRESS_ARRAY], addresses[0]?.premise);
    return renderPage(req, res, officerFiling, addresses, [validationError]);
  }

  const patchFiling: OfficerFiling = {
    serviceAddress: {
      premises: selectedAddress.premise,
      addressLine1: selectedAddress.addressLine1,
      addressLine2: selectedAddress.addressLine2,
      locality: selectedAddress.postTown,
      country: getCountryFromKey(selectedAddress.country),
      postalCode: selectedAddress.postcode
    }
  };
  await patchOfficerFiling(session, transactionId, submissionId, patchFiling);
  
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req);
  return res.redirect(nextPageUrl);
};

/**
 * Render the page with populated addresses from the postcode lookup service. Display any errors that are passed in.
 */
const renderPage = async (req: Request, res: Response, officerFiling: OfficerFiling, ukAddresses: UKAddress[], validationErrors: ValidationError[]) => {
  // Map the addresses to the format that will be displayed on the page
  const addressOptions = ukAddresses.map((address: UKAddress) => {
    return {
      premises: address.premise,
      formattedAddress: formatTitleCase(address.premise + " " + address.addressLine1 + (address.addressLine2 ? ", " + address.addressLine2 : "") + ", " + address.postTown + ", " + getCountryFromKey(address.country)) + ", " + address.postcode
    };
  });

  return res.render(Templates.DIRECTOR_CORRESPONDENCE_CHOOSE_ADDRESS, {
    templateName: Templates.DIRECTOR_CORRESPONDENCE_CHOOSE_ADDRESS,
    confirmAddressUrl: urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, req),
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req),
    enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    addresses: addressOptions,
    currentPremises: officerFiling.serviceAddress?.premises,
    errors: formatValidationErrors(validationErrors)
  });
}