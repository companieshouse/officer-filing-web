import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../utils/format";
import { COUNTRY_LIST } from "../../utils/properties";
import {
  Address,
  OfficerFiling,
  ValidationStatusResponse
} from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../../model/director.model";
import { getField, getDirectorNameBasedOnJourney } from "../../utils/web";
import { getValidationStatus } from "../../services/validation.status.service";
import { createValidationErrorBasic, formatValidationErrors, mapValidationResponseToAllowedErrorKey } from "../../validation/validation";
import { ValidationError } from "../../model/validation.model";
import {
    correspondenceAddressAddressLineOneErrorMessageKey,
    correspondenceAddressAddressLineTwoErrorMessageKey,
    correspondenceAddressCountryErrorMessageKey, correspondenceAddressLocalityErrorMessageKey,
    correspondenceAddressPostcodeErrorMessageKey,
    correspondenceAddressPremisesErrorMessageKey,
    correspondenceAddressRegionErrorMessageKey
} from "../../utils/api.enumerations.keys";
import { CorrespondenceManualAddressValidation } from "../../validation/address.validation.config";
import { validateManualAddress } from "../../validation/manual.address.validation";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsCorrespondenceAddressUpdated } from "../../utils/is.address.updated";
import { RenderManualEntryParams } from "../../utils/render.page.params";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH
} from "../../types/page.urls";

export const getDirectorCorrespondenceAddressManual = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPaths, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const locales = getLocalesService();
    const lang = selectLang(req.query.lang);

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);

    const correspondenceAddressBackParam = urlUtils.getBackLinkFromRequestParams(req);
    let backLink = addLangToUrl(urlUtils.getUrlToPath(backUrlPaths.correspondenceAddressSearchPath, req), lang);
    if(correspondenceAddressBackParam && correspondenceAddressBackParam.includes("confirm-correspondence-address")) {
      backLink = addLangToUrl(urlUtils.getUrlToPath(backUrlPaths.confirmCorrespondenceAddressPath, req), lang)
    }

    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: backLink,
      directorName: formatTitleCase(directorName),
      typeahead_array: COUNTRY_LIST,
      correspondence_address_premises: officerFiling.serviceAddress?.premises,
      correspondence_address_line_1: officerFiling.serviceAddress?.addressLine1,
      correspondence_address_line_2: officerFiling.serviceAddress?.addressLine2,
      correspondence_address_city: officerFiling.serviceAddress?.locality,
      correspondence_address_county: officerFiling.serviceAddress?.region,
      typeahead_value: officerFiling.serviceAddress?.country,
      correspondence_address_postcode: officerFiling.serviceAddress?.postalCode,
      correspondence_address_back_param: correspondenceAddressBackParam,
      ...getLocaleInfo(locales, lang),
      currentUrl: getCurrentUrl(req, isUpdate, lang)
    });
  } catch (e) {
    return next(e);
  }
};

export const postDirectorCorrespondenceAddressManual = async (req: Request, res: Response, next: NextFunction, nextPage: string, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const originalFiling = await getOfficerFiling(session, transactionId, submissionId);
    const lang = selectLang(req.query.lang);

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
      return renderPage(req, res, session, { 
        officerFiling: originalFiling,
        address: serviceAddress,
        validationErrors: jsValidationErrors,
        templateName,
        backUrlPath,
        isUpdate
      })
    }

    // Patch filing with updated information
    const officerFilingBody: OfficerFiling = {
      serviceAddress: serviceAddress
    };

    if (isUpdate) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const appointmentId = officerFiling.referenceAppointmentId as string;
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      officerFilingBody.correspondenceAddressHasBeenUpdated = checkIsCorrespondenceAddressUpdated( 
        { isServiceAddressSameAsRegisteredOfficeAddress: officerFiling.isServiceAddressSameAsRegisteredOfficeAddress, serviceAddress: officerFilingBody.serviceAddress }, 
        companyAppointment);
    }

    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    // Validate filing
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    const validationErrors = buildValidationErrors(validationStatus);
    if (validationErrors.length > 0) {
      return renderPage(req, res, session, { 
        officerFiling: originalFiling,
        address: serviceAddress,
        validationErrors,
        templateName,
        backUrlPath,
        isUpdate
      })
    }
  
    const nextPageUrl = addLangToUrl(urlUtils.getUrlToPath(nextPage, req), lang);
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

export const renderPage = async (req: Request, res: Response, session: Session, params: RenderManualEntryParams) => {
  const locales = getLocalesService();
  const lang = selectLang(req.query.lang);
  const formattedErrors = formatValidationErrors(params.validationErrors, lang);
  const directorName = await getDirectorNameBasedOnJourney(params.isUpdate, session, req, params.officerFiling);
  return res.render(params.templateName, {
    templateName: params.templateName,
    backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(params.backUrlPath, req), lang),
    directorName: formatTitleCase(directorName),
    typeahead_array: COUNTRY_LIST,
    correspondence_address_premises: params.address.premises,
    correspondence_address_line_1: params.address.addressLine1,
    correspondence_address_line_2: params.address.addressLine2,
    correspondence_address_city: params.address.locality,
    correspondence_address_county: params.address.region,
    typeahead_value: params.address.country,
    correspondence_address_postcode: params.address.postalCode,
    typeahead_errors: JSON.stringify(formattedErrors),
    errors: formattedErrors,
    ...getLocaleInfo(locales, lang),
    currentUrl : getCurrentUrl(req, params.isUpdate, lang)
  });
};

const getCurrentUrl = (req: Request, isUpdate: boolean, lang: string) => {
  if (isUpdate) {
    return addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req), lang);
  } else {
    return addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req), lang);
  }
}