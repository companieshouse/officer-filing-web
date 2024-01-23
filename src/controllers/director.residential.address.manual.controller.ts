import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH_END
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import {
  Address,
  OfficerFiling,
  ValidationStatusResponse
} from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getField } from "../utils/web";
import { getValidationStatus } from "../services/validation.status.service";
import { DirectorField } from "../model/director.model";
import { createValidationErrorBasic, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../validation/validation";
import { ValidationError } from "../model/validation.model";
import { residentialAddressAddressLineOneErrorMessageKey, residentialAddressAddressLineTwoErrorMessageKey, residentialAddressCountryErrorMessageKey, residentialAddressLocalityErrorMessageKey, residentialAddressPostcodeErrorMessageKey, residentialAddressPremisesErrorMessageKey, residentialAddressRegionErrorMessageKey } from "../utils/api.enumerations.keys";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { COUNTRY_LIST } from "../utils/properties";
import { validateManualAddress } from "../validation/manual.address.validation";
import { ResidentialManualAddressValidation } from "../validation/address.validation.config";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    const residentialAddressBackParam = urlUtils.getBackLinkFromRequestParams(req);
    let backLink = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req);
    if(residentialAddressBackParam && residentialAddressBackParam.includes("confirm-residential-address")) {
      backLink = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req)
    }
    
    return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL,
      backLinkUrl: backLink,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      typeahead_array: COUNTRY_LIST,
      residential_address_premises: officerFiling.residentialAddress?.premises,
      residential_address_line_1: officerFiling.residentialAddress?.addressLine1,
      residential_address_line_2: officerFiling.residentialAddress?.addressLine2,
      residential_address_city: officerFiling.residentialAddress?.locality,
      residential_address_county: officerFiling.residentialAddress?.region,
      typeahead_value: officerFiling.residentialAddress?.country,
      residential_address_postcode: officerFiling.residentialAddress?.postalCode,
      residential_address_back_param: residentialAddressBackParam
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

    const residentialAddress: Address = {
      premises: getField(req, DirectorField.RESIDENTIAL_ADDRESS_PREMISES),
      addressLine1: getField(req, DirectorField.RESIDENTIAL_ADDRESS_ADDRESS_LINE_1),
      addressLine2: getField(req, DirectorField.RESIDENTIAL_ADDRESS_ADDRESS_LINE_2),
      locality: getField(req, DirectorField.RESIDENTIAL_ADDRESS_CITY),
      region: getField(req, DirectorField.RESIDENTIAL_ADDRESS_COUNTY),
      country: getField(req, DirectorField.RESIDENTIAL_ADDRESS_COUNTRY),
      postalCode: getField(req, DirectorField.RESIDENTIAL_ADDRESS_POSTCODE),
    }

    // JS validation
    const jsValidationErrors = validateManualAddress(residentialAddress, ResidentialManualAddressValidation);

    if(jsValidationErrors.length > 0) {
      return renderPage(req, res, residentialAddress, originalFiling, jsValidationErrors);
    }
    // Patch filing with updated information
    let officerFiling: OfficerFiling = {
      residentialAddress: residentialAddress,
      residentialAddressBackLink: DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END
    };
    officerFiling = (await patchOfficerFiling(session, transactionId, submissionId, officerFiling)).data;

    // Validate filing
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    const validationErrors = buildValidationErrors(validationStatus);
    if (validationErrors.length > 0) {
      return renderPage(req, res, residentialAddress, officerFiling, validationErrors)
    }
  
    const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req);
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
  var premisesKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, residentialAddressPremisesErrorMessageKey);
  if (premisesKey) {
    validationErrors.push(createValidationErrorBasic(premisesKey, DirectorField.RESIDENTIAL_ADDRESS_PREMISES));
  }

  // Address line 1
  var addressLineOneKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, residentialAddressAddressLineOneErrorMessageKey);
  if (addressLineOneKey) {
    validationErrors.push(createValidationErrorBasic(addressLineOneKey, DirectorField.RESIDENTIAL_ADDRESS_ADDRESS_LINE_1));
  }

  // Address line 2
  var addressLineTwoKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, residentialAddressAddressLineTwoErrorMessageKey);
  if (addressLineTwoKey) {
    validationErrors.push(createValidationErrorBasic(addressLineTwoKey, DirectorField.RESIDENTIAL_ADDRESS_ADDRESS_LINE_2));
  }

  // City
  var cityKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, residentialAddressLocalityErrorMessageKey);
  if (cityKey) {
    validationErrors.push(createValidationErrorBasic(cityKey, DirectorField.RESIDENTIAL_ADDRESS_CITY));
  }

  // County
  var countyKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, residentialAddressRegionErrorMessageKey);
  if (countyKey) {
    validationErrors.push(createValidationErrorBasic(countyKey, DirectorField.RESIDENTIAL_ADDRESS_COUNTY));
  }

  // Country
  var countryKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, residentialAddressCountryErrorMessageKey);
  if (countryKey) {
    validationErrors.push(createValidationErrorBasic(countryKey, DirectorField.RESIDENTIAL_ADDRESS_COUNTRY));
  }

  // Postcode
  var postcodeKey = mapValidationResponseToAllowedErrorKey(validationStatusResponse, residentialAddressPostcodeErrorMessageKey);
  if (postcodeKey) {
    validationErrors.push(createValidationErrorBasic(postcodeKey, DirectorField.RESIDENTIAL_ADDRESS_POSTCODE));
  }

  return validationErrors;
}

export const renderPage = (req: Request, res: Response, residentialAddress: Address, officerFiling: OfficerFiling, validationErrors: ValidationError[]) => {
  const formattedErrors = formatValidationErrors(validationErrors);
  return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, {
    templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL,
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    typeahead_array: COUNTRY_LIST,
    residential_address_premises: residentialAddress.premises,
    residential_address_line_1: residentialAddress.addressLine1,
    residential_address_line_2: residentialAddress.addressLine2,
    residential_address_city: residentialAddress.locality,
    residential_address_county: residentialAddress.region,
    typeahead_value: residentialAddress.country,
    residential_address_postcode: residentialAddress.postalCode,
    typeahead_errors: JSON.stringify(formattedErrors),
    errors: formattedErrors,
  });
}