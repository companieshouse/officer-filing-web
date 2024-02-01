import { NextFunction, Request, Response } from "express";
import { getCountryFromKey, setBackLink } from "../../utils/web";
import { urlUtils } from "../../utils/url";
import { getUKAddressesFromPostcode } from "../../services/postcode.lookup.service";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../../utils/properties";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { DirectorField } from "../../model/director.model";
import { createValidationError, formatValidationErrors } from "../../validation/validation";
import { correspondenceAddressErrorMessageKey } from "../../utils/api.enumerations.keys";
import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH
} from "../../types/page.urls";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { ValidationError } from "../../model/validation.model";


export const getCorrespondenceAddressChooseAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try{
    const session: Session = req.session as Session;
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);

    const postalCode = officerFiling?.serviceAddress?.postalCode;
    if (!postalCode) {
      throw new Error("Postal code is undefined");
    }
    const addresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postalCode.replace(/\s/g, ''));
    return renderPage(req, res, officerFiling, addresses, [], templateName, backUrlPath, isUpdate)
  } catch (e) {
    return next(e);
  }
}

export const postCorrespondenceAddressChooseAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  const session: Session = req.session as Session;
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

  const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
  const confirmAddressUrl : string = isUpdate ? urlUtils.getUrlToPath(UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req) : urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req) ;

  const postalCode = officerFiling?.serviceAddress?.postalCode;
  if (!postalCode) {
    throw new Error("Postal code is undefined");
  }
  const addresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postalCode.replace(/\s/g, ''));
  const selectedPremises = req.body[DirectorField.ADDRESS_ARRAY];
  const selectedAddress = addresses.find((address: UKAddress) => address.premise === selectedPremises);
  if (!selectedAddress) {
    const validationError = createValidationError(correspondenceAddressErrorMessageKey.CORRESPONDENCE_ADDRESS_BLANK, [DirectorField.ADDRESS_ARRAY], addresses[0]?.premise);
    return renderPage(req, res, officerFiling, addresses, [validationError], templateName, backUrlPath, isUpdate);
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

  return res.redirect(confirmAddressUrl);

}

/**
 * Render the page with populated addresses from the postcode lookup service. Display any errors that are passed in.
 */
const renderPage = async (req: Request, res: Response, officerFiling: OfficerFiling, ukAddresses: UKAddress[], validationErrors: ValidationError[], templateName: string, backUrlPath: string, isUpdate: boolean) => {
  let manualAddressUrl : string;
  let confirmAddressUrl : string;
  if(!isUpdate) {
    manualAddressUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req);
    confirmAddressUrl = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req);
  } else {
    manualAddressUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req);
    confirmAddressUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req);
  }

  // Map the addresses to the format that will be displayed on the page
  const addressOptions = ukAddresses.map((address: UKAddress) => {
    return {
      premises: address.premise,
      formattedAddress: formatTitleCase(address.premise + " " + address.addressLine1 + (address.addressLine2 ? ", " + address.addressLine2 : "") + ", " + address.postTown + ", " + getCountryFromKey(address.country)) + ", " + address.postcode
    };
  });

  return res.render(templateName, {
    templateName: templateName,
    confirmAddressUrl: confirmAddressUrl,
    backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(backUrlPath, req)),
    enterAddressManuallyUrl: manualAddressUrl,
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    addresses: addressOptions,
    currentPremises: officerFiling.serviceAddress?.premises,
    errors: formatValidationErrors(validationErrors)
  });
}