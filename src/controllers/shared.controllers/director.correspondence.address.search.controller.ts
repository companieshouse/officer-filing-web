import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase } from "../../utils/format";
import { DirectorField } from "../../model/director.model";
import { PostcodeValidation, PremiseValidation } from "../../validation/address.validation.config";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { formatValidationErrors } from "../../validation/validation";
import { ValidationError } from "../../model/validation.model";
import { validateUKPostcode } from "../../validation/uk.postcode.validation";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../../utils/properties";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { getUKAddressesFromPostcode } from "../../services/postcode.lookup.service";
import { getCountryFromKey, getDirectorNameBasedOnJourney } from "../../utils/web";
import { validatePostcode } from "../../validation/postcode.validation";
import { validatePremise } from "../../validation/premise.validation";
import { Templates } from "../../types/template.paths";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsCorrespondenceAddressUpdated } from "../../utils/is.address.updated";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";

export const getCorrespondenceAddressLookUp = async (req: Request, res: Response, next: NextFunction, templateName: string, backLink: string, manualAddressPath: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    return res.render(templateName, {
      ...getLocaleInfo(locales, lang),
      currentUrl: getCurrentUrl(isUpdate, req),
      templateName: templateName,
      enterAddressManuallyUrl: addLangToUrl(urlUtils.getUrlToPath(manualAddressPath, req), lang),
      backLinkUrl:  addLangToUrl(urlUtils.getUrlToPath(backLink, req),lang),
      directorName: formatTitleCase(directorName),
      postcode: officerFiling.serviceAddress?.postalCode,
      premises: officerFiling.serviceAddress?.premises,
    });
  } catch (e) {
    return next(e);
  }
};

export const postCorrespondenceAddressLookUp = async (req: Request, res: Response, next: NextFunction, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const originalOfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const correspondencePostalCode : string = (req.body[DirectorField.POSTCODE])?.trim().toUpperCase();
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
                       "country" : ""}    };

    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, prepareOfficerFiling);

    // Validate formatting errors for fields, render errors if found.
    if(jsValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors, isUpdate, directorName);
    }

    // Validate postcode field for UK postcode, render errors if postcode not found.
    const jsUKPostcodeValidationErrors = await validateUKPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, correspondencePostalCode.replace(/\s/g,''), PostcodeValidation, jsValidationErrors) ;
    if(jsUKPostcodeValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors, isUpdate, directorName);
    }

    let companyAppointment: CompanyAppointment | undefined = undefined;
    if (isUpdate) {
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      const appointmentId = originalOfficerFiling.referenceAppointmentId as string;
      companyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      prepareOfficerFiling.serviceAddressHasBeenUpdated = checkIsCorrespondenceAddressUpdated(
        { isServiceAddressSameAsRegisteredOfficeAddress: originalOfficerFiling.isServiceAddressSameAsRegisteredOfficeAddress, serviceAddress: prepareOfficerFiling.serviceAddress },
        companyAppointment);
    }

    // Patch the filing with updated information
    await patchOfficerFiling(session, transactionId, submissionId, prepareOfficerFiling);

    return await matchAddress(req, res, isUpdate, { correspondencePremise, correspondencePostalCode }, companyAppointment, originalOfficerFiling, { session, transactionId, submissionId });
  }
  catch (e) {
    return next(e);
  }
};

const matchAddress = async (req, res, isUpdate, { correspondencePremise, correspondencePostalCode }, companyAppointment, originalOfficerFiling, { session, transactionId, submissionId }) => {
  const nextPageConfirmUrl = isUpdate ? UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH : DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH;
  const nextPage = isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH;

  // Look up the addresses, as by now validated postcode is valid and exist
  const ukAddresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, correspondencePostalCode.replace(/\s/g,''));
  // If premises is entered by user, loop through addresses to find user entered premise
  const lang = selectLang(req.query.lang);
  if (correspondencePremise) {
    for (const ukAddress of ukAddresses) {
      if (ukAddress.premise.toUpperCase() === correspondencePremise.toUpperCase()) {
        const officerFiling: OfficerFiling = {
          serviceAddress: {"premises": ukAddress.premise,
            "addressLine1": ukAddress.addressLine1,
            "addressLine2": ukAddress.addressLine2,
            "locality": ukAddress.postTown,
            "postalCode": ukAddress.postcode,
            "country" : getCountryFromKey(ukAddress.country)}
        };

        if (isUpdate && companyAppointment !== undefined) {
          officerFiling.serviceAddressHasBeenUpdated = checkIsCorrespondenceAddressUpdated(
            { isServiceAddressSameAsRegisteredOfficeAddress: originalOfficerFiling.isServiceAddressSameAsRegisteredOfficeAddress, serviceAddress: officerFiling.serviceAddress },
            companyAppointment);
        }

        // Patch filing with updated information
        await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
        const nextPageUrlForConfirm = urlUtils.getUrlToPath(nextPageConfirmUrl, req);
        return res.redirect(addLangToUrl(nextPageUrlForConfirm,lang));
      }
    }
  }
  // Redirect user to choose addresses if premises not supplied or not found in addresses array
  const nextPageUrl = urlUtils.getUrlToPath(nextPage, req);
  return res.redirect(addLangToUrl(nextPageUrl, lang));
};

const renderPage = (res: Response, req: Request, officerFiling : OfficerFiling, validationErrors: ValidationError[], isUpdate: boolean, directorName: string) => {
  const backLink = isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_PATH;
  const manualAddressPath = isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH;
  const templateName = isUpdate ? Templates.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH : Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH;
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  return res.render(templateName, {
    ...getLocaleInfo(locales, lang),
    templateName: templateName,
    currentUrl: getCurrentUrl(isUpdate, req),
    enterAddressManuallyUrl: addLangToUrl(urlUtils.getUrlToPath(manualAddressPath, req), lang),
    backLinkUrl:  addLangToUrl(urlUtils.getUrlToPath(backLink, req), lang),
    directorName: formatTitleCase(directorName),
    postcode: officerFiling.serviceAddress?.postalCode,
    premises: officerFiling.serviceAddress?.premises,
    errors: formatValidationErrors(validationErrors, lang)
  });
}

const getCurrentUrl = (isUpdate: boolean, req: Request) => {
  if(isUpdate){
    return urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req)
  }
  return urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req)
}

