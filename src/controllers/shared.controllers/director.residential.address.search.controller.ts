import { NextFunction, Request, Response } from "express";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../../utils/properties";
import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../../model/director.model";
import { formatValidationErrors } from "../../validation/validation";
import { ValidationError } from "../../model/validation.model";
import { getUKAddressesFromPostcode } from "../../services/postcode.lookup.service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { validatePostcode } from "../../validation/postcode.validation";
import { PostcodeValidation, PremiseValidation, ResidentialManualAddressValidation } from "../../validation/address.validation.config";
import { validateUKPostcode } from "../../validation/uk.postcode.validation";
import { validatePremise } from "../../validation/premise.validation";
import { getCountryFromKey, getDirectorNameBasedOnJourney } from "../../utils/web";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsResidentialAddressUpdated } from "../../utils/is.address.updated";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../../services/company.profile.service";
import { validateManualAddress } from "../../validation/manual.address.validation";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";

const incompleteROABackLinkText = "Go back to 'What is the directors correspondence address?'";
const completeROABackLinkText = "Back";

export const getDirectorResidentialAddressSearch = async (req: Request, res: Response, next: NextFunction, templateName: string, pageLinks: PageLinks, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
    const backLinkInfo = await getBackLinkInfo(req, urlUtils.getCompanyNumberFromRequestParams(req), pageLinks);
    const lang = selectLang(req.query.lang);

    return res.render(templateName, {
      templateName: templateName,
      ...getLocaleInfo(getLocalesService(), lang),
      currentUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req),
      enterAddressManuallyUrl: addLangToUrl(urlUtils.getUrlToPath(pageLinks.manualEntryLink, req), lang),
      backLinkUrl:  addLangToUrl(backLinkInfo.backLinkUrl, lang),
      backLinkText: backLinkInfo.backLinkText,
      directorName: formatTitleCase(directorName),
      postcode: officerFiling.residentialAddress?.postalCode,
      premises: officerFiling.residentialAddress?.premises
    });
  } catch (e) {
    return next(e);
  }
};

export const postDirectorResidentialAddressSearch = async (req: Request, res: Response, next: NextFunction, templateName: string, pageLinks: PageLinks, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const lang = selectLang(req.query.lang);
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
                           "country" : ""},
      residentialAddressHasBeenUpdated: false
      };

    // Validate formatting errors for fields, render errors if found.
    if(jsValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors, templateName, pageLinks, isUpdate);
    }

    // Validate postcode field for UK postcode, render errors if postcode not found.
    const jsUKPostcodeValidationErrors = await validateUKPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, residentialPostalCode.replace(/\s/g,''), PostcodeValidation, jsValidationErrors) ;
    if(jsUKPostcodeValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors, templateName, pageLinks, isUpdate);
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
          
          setUpdateBoolean(req, isUpdate, session, officerFiling, originalOfficerFiling.isHomeAddressSameAsServiceAddress);
          // Patch filing with updated information
          await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
          return res.redirect(addLangToUrl(getConfirmAddressPath(req, isUpdate), lang));
        }
      }
    }

    // Redirect user to choose addresses if premises not supplied or not found in addresses array
    return res.redirect(addLangToUrl(getAddressSearchPath(req, isUpdate), lang));

  }
  catch (e) {
    return next(e);
  }
};

const setUpdateBoolean = async (req: Request, isUpdate: boolean, session: Session, officerFiling : OfficerFiling, isHomeAddressSameAsServiceAddress: boolean | undefined) => {
  if (isUpdate) {
    const appointmentId = officerFiling.referenceAppointmentId as string;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
    officerFiling.residentialAddressHasBeenUpdated = checkIsResidentialAddressUpdated(
      { isHomeAddressSameAsServiceAddress: isHomeAddressSameAsServiceAddress, residentialAddress: officerFiling.residentialAddress },
      companyAppointment);
  }
}

const getConfirmAddressPath = (req: Request, isUpdate: boolean) => {
  if(isUpdate) {
    return urlUtils.getUrlToPath(UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req);
  }
  else{
    return urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req);
  }
}

const getAddressSearchPath = (req: Request, isUpdate: boolean) => {
  if(isUpdate){
    return urlUtils.getUrlToPath(UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, req);
  }
  else{
    return urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, req);
  }
}

const renderPage = async (res: Response, req: Request, officerFiling : OfficerFiling, validationErrors: ValidationError[], templateName: string, pageLinks: PageLinks, isUpdate: boolean) => {
  const session: Session = req.session as Session;
  const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
  const backLinkInfo = await getBackLinkInfo(req, urlUtils.getCompanyNumberFromRequestParams(req), pageLinks);
  const lang = selectLang(req.query.lang);
  return res.render(templateName, {
    templateName: templateName,
    ...getLocaleInfo(getLocalesService(), lang),
    currentUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req),
    enterAddressManuallyUrl: urlUtils.getUrlToPath(pageLinks.manualEntryLink, req),
    backLinkUrl: backLinkInfo.backLinkUrl,
    backLinkText: backLinkInfo.backLinkText,
    directorName: formatTitleCase(directorName),
    postcode: officerFiling.residentialAddress?.postalCode,
    premises: officerFiling.residentialAddress?.premises,
    errors: formatValidationErrors(validationErrors, lang),
  });
}

export interface PageLinks {
  backLinkWhenCompleteROA: string,
  backLinkWhenIncompleteROA: string,
  manualEntryLink: string
}

const getBackLinkInfo = async (req: Request, companyNumber: string, pageLinks: PageLinks) => {
  const companyProfile = await getCompanyProfile(companyNumber);
  const registeredOfficeAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
  if (registeredOfficeAddress === undefined) {
    return { backLinkUrl: urlUtils.getUrlToPath(pageLinks.backLinkWhenIncompleteROA, req), backLinkText: incompleteROABackLinkText};
  }
  const registeredOfficeAddressAsCorrespondenceAddressErrors = validateManualAddress(registeredOfficeAddress, ResidentialManualAddressValidation);
  if (registeredOfficeAddressAsCorrespondenceAddressErrors.length !== 0) {
    return { backLinkUrl: urlUtils.getUrlToPath(pageLinks.backLinkWhenIncompleteROA, req), backLinkText: incompleteROABackLinkText };
  }
  return { backLinkUrl: urlUtils.getUrlToPath(pageLinks.backLinkWhenCompleteROA, req), backLinkText: completeROABackLinkText };
};
