import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { COUNTRY_LIST } from "../utils/properties";
import {
  Address,
  OfficerFiling,
  ValidationStatusResponse
} from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../model/director.model";
import { getField } from "../utils/web";
import { getValidationStatus } from "../services/validation.status.service";
import { createValidationErrorBasic, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { ValidationError } from "../model/validation.model";
import { correspondenceAddressAddressLineOneErrorMessageKey, correspondenceAddressAddressLineTwoErrorMessageKey, correspondenceAddressCountryErrorMessageKey, correspondenceAddressLocalityErrorMessageKey, correspondenceAddressPostcodeErrorMessageKey, correspondenceAddressPremisesErrorMessageKey, correspondenceAddressRegionErrorMessageKey } from "../utils/api.enumerations.keys";
import {CorrespondenceManualAddressValidation} from "../validation/address.validation.config";
import {validateManualAddress} from "../validation/manual.address.validation";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    const correspondenceAddressBackParam = urlUtils.getBackLinkFromRequestParams(req);
    let backLink = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req);
    if(correspondenceAddressBackParam && correspondenceAddressBackParam.includes("confirm-correspondence-address")) {
      backLink = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req)
    }
    
    return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, {
      templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL,
      backLinkUrl: backLink,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      typeahead_array: COUNTRY_LIST,
      correspondence_address_premises: officerFiling.serviceAddress?.premises,
      correspondence_address_line_1: officerFiling.serviceAddress?.addressLine1,
      correspondence_address_line_2: officerFiling.serviceAddress?.addressLine2,
      correspondence_address_city: officerFiling.serviceAddress?.locality,
      correspondence_address_county: officerFiling.serviceAddress?.region,
      typeahead_value: officerFiling.serviceAddress?.country,
      correspondence_address_postcode: officerFiling.serviceAddress?.postalCode,
      correspondence_address_back_param: correspondenceAddressBackParam
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
    const originalFiling = await getOfficerFiling(session, transactionId, submissionId);

    const serviceAddress : Address =  {
      premises: getField(req, DirectorField.CORRESPONDENCE_ADDRESS_PREMISES),
      addressLine1: getField(req, DirectorField.CORRESPONDENCE_ADDRESS_ADDRESS_LINE_1),
      addressLine2: getField(req, DirectorField.CORRESPONDENCE_ADDRESS_ADDRESS_LINE_2),
      locality: getField(req, DirectorField.CORRESPONDENCE_ADDRESS_CITY),
      region: getField(req, DirectorField.CORRESPONDENCE_ADDRESS_COUNTY),
      country: getField(req, DirectorField.CORRESPONDENCE_ADDRESS_COUNTRY),
      postalCode: getField(req, DirectorField.CORRESPONDENCE_ADDRESS_POSTCODE),
    }

    // JS validation
    const jsValidationErrors = validateManualAddress(serviceAddress, CorrespondenceManualAddressValidation);

    if(jsValidationErrors.length > 0) {
      return renderPage(req, res, serviceAddress, originalFiling, jsValidationErrors);
    }

    // Patch filing with updated information
    let officerFiling: OfficerFiling = {
      serviceAddress: serviceAddress
    };
    officerFiling = (await patchOfficerFiling(session, transactionId, submissionId, officerFiling)).data;

    // Validate filing
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    const validationErrors = buildValidationErrors(validationStatus);
    if (validationErrors.length > 0) {
      return renderPage(req, res, serviceAddress, officerFiling, validationErrors);
    }
  
    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

/**
 * Build a list of error objects that will be displayed on the page, based on the result from getValidation.
 * Only certain relevant errors to do with the elements on the page will be returned, others will be ignored.
 * 
 * @param validationStatusResponse Response from running getValidation. Contains the api validation messages
 * @returns A list of ValidationError objects that contain the messages and info to display on the page
 */
export const buildValidationErrors = (validationStatusResponse: ValidationStatusResponse): ValidationError[] => {
  const validationErrors: ValidationError[] = [];

  // Premises
  var premisesKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, correspondenceAddressPremisesErrorMessageKey);
  if (premisesKey) {
    validationErrors.push(createValidationErrorBasic(premisesKey, DirectorField.CORRESPONDENCE_ADDRESS_PREMISES));
  }

  // Address line 1
  var addressLineOneKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, correspondenceAddressAddressLineOneErrorMessageKey);
  if (addressLineOneKey) {
    validationErrors.push(createValidationErrorBasic(addressLineOneKey, DirectorField.CORRESPONDENCE_ADDRESS_ADDRESS_LINE_1));
  }

  // Address line 2
  var addressLineTwoKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, correspondenceAddressAddressLineTwoErrorMessageKey);
  if (addressLineTwoKey) {
    validationErrors.push(createValidationErrorBasic(addressLineTwoKey, DirectorField.CORRESPONDENCE_ADDRESS_ADDRESS_LINE_2));
  }

  // City
  var cityKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, correspondenceAddressLocalityErrorMessageKey);
  if (cityKey) {
    validationErrors.push(createValidationErrorBasic(cityKey, DirectorField.CORRESPONDENCE_ADDRESS_CITY));
  }

  // County
  var countyKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, correspondenceAddressRegionErrorMessageKey);
  if (countyKey) {
    validationErrors.push(createValidationErrorBasic(countyKey, DirectorField.CORRESPONDENCE_ADDRESS_COUNTY));
  }

  // Country
  var countryKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, correspondenceAddressCountryErrorMessageKey);
  if (countryKey) {
    validationErrors.push(createValidationErrorBasic(countryKey, DirectorField.CORRESPONDENCE_ADDRESS_COUNTRY));
  }

  // Postcode
  var postcodeKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, correspondenceAddressPostcodeErrorMessageKey);
  if (postcodeKey) {
    validationErrors.push(createValidationErrorBasic(postcodeKey, DirectorField.CORRESPONDENCE_ADDRESS_POSTCODE));
  }

  return validationErrors;
}

export const renderPage = (req: Request, res: Response, serviceAddress: Address, officerFiling: OfficerFiling, validationErrors: ValidationError[]) => {
  const formattedErrors = formatValidationErrors(validationErrors);
  return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, {
    templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL,
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    typeahead_array: COUNTRY_LIST,
    correspondence_address_premises: serviceAddress.premises,
    correspondence_address_line_1: serviceAddress.addressLine1,
    correspondence_address_line_2: serviceAddress.addressLine2,
    correspondence_address_city: serviceAddress.locality,
    correspondence_address_county: serviceAddress.region,
    typeahead_value: serviceAddress.country,
    correspondence_address_postcode: serviceAddress.postalCode,
    typeahead_errors: JSON.stringify(formattedErrors),
    errors: formattedErrors,
  });
}
