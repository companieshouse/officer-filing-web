import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { DirectorField } from "../../model/director.model";
import { PostcodeValidation, PremiseValidation } from "../../validation/address.validation.config";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { formatValidationErrors } from "../../validation/validation";
import { ValidationError } from "../../model/validation.model";
import { validateUKPostcode } from "../../validation/uk.postcode.validation";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../../utils/properties";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { getUKAddressesFromPostcode } from "../../services/postcode.lookup.service";
import { getCountryFromKey } from "../../utils/web";
import { validatePostcode } from "../../validation/postcode.validation";
import { validatePremise } from "../../validation/premise.validation";
import { Templates } from "../../types/template.paths";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsCorrespondenceAddressUpdated } from "./director.correspondence.address.manual.controller";

export const getCorrespondenceAddressLookUp = async (req: Request, res: Response, next: NextFunction, templateName: string, backLink: string, manualAddressPath: string) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(templateName, {
      templateName: templateName,
      enterAddressManuallyUrl: urlUtils.getUrlToPath(manualAddressPath, req),
      backLinkUrl: urlUtils.getUrlToPath(backLink, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
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
    const templateName = isUpdate ? Templates.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH : Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH;
    const backLink = isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_PATH;
    const manualAddressPath = isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH;
    const nextPageConfirmUrl = isUpdate ? UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH : DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH;
    const nextPage = isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH;

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

    // Validate formatting errors for fields, render errors if found.
    if(jsValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors, templateName, backLink, manualAddressPath);
    }

    // Validate postcode field for UK postcode, render errors if postcode not found.
    const jsUKPostcodeValidationErrors = await validateUKPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, correspondencePostalCode.replace(/\s/g,''), PostcodeValidation, jsValidationErrors) ;
    if(jsUKPostcodeValidationErrors.length > 0) {
      return renderPage(res, req, prepareOfficerFiling, jsValidationErrors, templateName, backLink, manualAddressPath);
    }

    // Patch the filing with updated information
    await patchOfficerFiling(session, transactionId, submissionId, prepareOfficerFiling);

    // Look up the addresses, as by now validated postcode is valid and exist
    const ukAddresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, correspondencePostalCode.replace(/\s/g,''));
    // If premises is entered by user, loop through addresses to find user entered premise
    if(correspondencePremise) {
      for(const ukAddress of ukAddresses) {
        if(ukAddress.premise.toUpperCase() === correspondencePremise.toUpperCase()) {
          const officerFiling: OfficerFiling = {
            serviceAddress: {"premises": ukAddress.premise,
              "addressLine1": ukAddress.addressLine1,
              "addressLine2": ukAddress.addressLine2,
              "locality": ukAddress.postTown,
              "postalCode": ukAddress.postcode,
              "country" : getCountryFromKey(ukAddress.country)}
          };
          setUpdateBoolean(req, isUpdate, session, officerFiling);
          // Patch filing with updated information
          await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
          const nextPageUrlForConfirm = urlUtils.getUrlToPath(nextPageConfirmUrl, req);
          return res.redirect(nextPageUrlForConfirm);
        }
      }
    }
    // Redirect user to choose addresses if premises not supplied or not found in addresses array
    const nextPageUrl = urlUtils.getUrlToPath(nextPage, req);
    return res.redirect(nextPageUrl);

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
    officerFiling.residentialAddressHasBeenUpdated = checkIsCorrespondenceAddressUpdated(
      { ...officerFiling,
      residentialAddress: officerFiling.residentialAddress }, companyAppointment);
  }
};

const renderPage = (res: Response, req: Request, officerFiling : OfficerFiling, validationErrors: ValidationError[], templateName: string, backLink: string, manualAddressLink: string) => {
  return res.render(templateName, {
    templateName: templateName,
    enterAddressManuallyUrl: urlUtils.getUrlToPath(manualAddressLink, req),
    backLinkUrl: urlUtils.getUrlToPath(backLink, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    postcode: officerFiling.serviceAddress?.postalCode,
    premises: officerFiling.serviceAddress?.premises,
    errors: formatValidationErrors(validationErrors)
  });
}
