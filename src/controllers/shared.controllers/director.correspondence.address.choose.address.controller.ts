import { NextFunction, Request, Response } from "express";
import {getAddressOptions, getCountryFromKey, setBackLink} from "../../utils/web";
import { urlUtils } from "../../utils/url";
import { getUKAddressesFromPostcode } from "../../services/postcode.lookup.service";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../../utils/properties";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { DirectorField } from "../../model/director.model";
import { createValidationError, formatValidationErrors } from "../../validation/validation";
import { correspondenceAddressErrorMessageKey } from "../../utils/api.enumerations.keys";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH
} from "../../types/page.urls";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { RenderPageParams } from "../../utils/render.page.params";


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
    return renderPage(req, res, {
      officerFiling: officerFiling,
      ukAddresses: addresses,
      validationErrors: [],
      templateName: templateName,
      backUrlPath: backUrlPath,
      isUpdate: isUpdate
    })
  } catch (e) {
    return next(e);
  }
}

export const postCorrespondenceAddressChooseAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, nextPagePath: string, isUpdate: boolean) => {
  const session: Session = req.session as Session;
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

  const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
  const confirmAddressUrl = urlUtils.getUrlToPath(nextPagePath, req);

  const postalCode = officerFiling?.serviceAddress?.postalCode ?? '';
  const addresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postalCode.replace(/\s/g, ''));
  const selectedPremises = req.body[DirectorField.ADDRESS_ARRAY];
  const selectedAddress = addresses.find((address: UKAddress) => address.premise === selectedPremises);
  if (!selectedAddress) {
    const validationError = createValidationError(correspondenceAddressErrorMessageKey.CORRESPONDENCE_ADDRESS_BLANK, [DirectorField.ADDRESS_ARRAY], addresses[0]?.premise);
    return renderPage(req, res, {
      officerFiling: officerFiling,
      ukAddresses: addresses,
      validationErrors: [validationError],
      templateName: templateName,
      backUrlPath: backUrlPath,
      isUpdate: isUpdate
    });
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
const renderPage = async (req: Request, res: Response, params: RenderPageParams) => {
  const manualAddressPath = params.isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH;
  const addressOptions = getAddressOptions(params.ukAddresses);

  return res.render(params.templateName, {
    templateName: params.templateName,
    backLinkUrl: setBackLink(req, params.officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(params.backUrlPath, req)),
    enterAddressManuallyUrl: urlUtils.getUrlToPath(manualAddressPath, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(params.officerFiling)),
    addresses: addressOptions,
    currentPremises: params.officerFiling.serviceAddress?.premises,
    errors: formatValidationErrors(params.validationErrors)
  });
}