import { NextFunction, Request, Response } from "express";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../../utils/properties";
import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { DirectorField } from "../../model/director.model";
import { formatValidationErrors } from "../../validation/validation";
import { ValidationError } from "../../model/validation.model";
import { getUKAddressesFromPostcode } from "../../services/postcode.lookup.service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { validatePostcode } from "../../validation/postcode.validation";
import { PostcodeValidation, PremiseValidation } from "../../validation/address.validation.config";
import { validateUKPostcode } from "../../validation/uk.postcode.validation";
import { validatePremise } from "../../validation/premise.validation";
import { getCountryFromKey } from "../../utils/web";
import { compareAddress } from "../../utils/address";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";

export const getDirectorResidentialAddressSearch = async (req: Request, res: Response, next: NextFunction, templateName: string, backLink: string) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(templateName, {
      templateName: templateName,
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
      backLinkUrl: urlUtils.getUrlToPath(backLink, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      postcode: officerFiling.residentialAddress?.postalCode,
      premises: officerFiling.residentialAddress?.premises
    });
  } catch (e) {
    return next(e);
  }
};

export const postDirectorResidentialAddressSearch = async (req: Request, res: Response, next: NextFunction, templateName: string, backLink: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
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
                           "country" : ""},
      residentialAddressHasBeenUpdated: false
      };

    // Validate formatting errors for fields, render errors if found.
    if(jsValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors, templateName, backLink);
    }

    // Validate postcode field for UK postcode, render errors if postcode not found.
    const jsUKPostcodeValidationErrors = await validateUKPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, residentialPostalCode.replace(/\s/g,''), PostcodeValidation, jsValidationErrors) ;
    if(jsUKPostcodeValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors, templateName, backLink);
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
          
          setUpdateBoolean(req, isUpdate, session, officerFiling)
          // Patch filing with updated information
          await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
          return res.redirect(getConfirmAddressPath(req, isUpdate));
        }
      }
    }

    // Redirect user to choose addresses if premises not supplied or not found in addresses array
    return res.redirect(getAddressSearchPath(req, isUpdate));

  }
  catch (e) {
    return next(e);
  }
};

const setUpdateBoolean = async (req: Request, isUpdate: boolean, session: Session, officerFiling : OfficerFiling) => {
  if(isUpdate) {
    const appointmentId = officerFiling.referenceAppointmentId as string;
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
    if(!compareAddress(officerFiling.residentialAddress,companyAppointment.usualResidentialAddress)){
      officerFiling.residentialAddressHasBeenUpdated = true;
    }
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

const renderPage = (res: Response, req: Request, officerFiling : OfficerFiling, validationErrors: ValidationError[], templateName: string, backLink: string) => {
  return res.render(templateName, {
    templateName: templateName,
    enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
    backLinkUrl: urlUtils.getUrlToPath(backLink, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    postcode: officerFiling.residentialAddress?.postalCode,
    premises: officerFiling.residentialAddress?.premises,
    errors: formatValidationErrors(validationErrors),
  });
}