import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, 
        DIRECTOR_PROTECTED_DETAILS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END, DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH_END, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, 
      } from '../types/page.urls';
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { whereDirectorLiveResidentialErrorMessageKey } from '../utils/api.enumerations.keys';
import { createValidationErrorBasic, formatValidationErrors } from '../validation/validation';
import { FormattedValidationErrors, ValidationError } from "../model/validation.model";
import { getOfficerFiling, patchOfficerFiling } from '../services/officer.filing.service';
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

const directorResidentialChoiceHtmlField: string = "director_address";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { officerFiling, companyProfile } = await urlUtilsRequestParams(req);
    return renderPage(req, res, officerFiling, companyProfile);
  } catch (e) {
    next(e);
  }
};

export const urlUtilsRequestParams = async (req: Request) => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
  const session: Session = req.session as Session;
  const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
  const companyProfile = await getCompanyProfile(companyNumber);
  return { officerFiling, companyProfile, transactionId, submissionId, session };
}

export const getBackLinkUrl = (req: Request): string => {
  const callerUrl = req.headers.referer;
  if (callerUrl !== undefined && callerUrl.includes(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH)) {
    return urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req);
  }
  else if (callerUrl !== undefined && callerUrl.endsWith(DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH_END)) {
    return urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH, req);
  }
   else {
    return urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req);
  }
}

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const selectedSraAddressChoice = req.body[directorResidentialChoiceHtmlField];
    const { officerFiling, companyProfile, transactionId, session, submissionId } = await urlUtilsRequestParams(req);
    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return renderPage(req, res, officerFiling, companyProfile, formattedErrors);
    }

    const officerFilingBody: OfficerFiling = {
      directorResidentialAddressChoice: selectedSraAddressChoice,
      protectedDetailsBackLink: DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END
    };
    if (selectedSraAddressChoice === "director_registered_office_address") {
      officerFilingBody.isHomeAddressSameAsServiceAddress = false;
      officerFilingBody.residentialAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
      const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

      return patchFiling.data.checkYourAnswersLink
        ? res.redirect(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req))
        : res.redirect(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req));
    } else if (selectedSraAddressChoice === "director_correspondence_address") {
      officerFilingBody.residentialAddress = officerFiling.serviceAddress;
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

      if(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress){
        return checkRedirectUrl(officerFiling,  urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req), res,  req);
      }
      else{
        return checkRedirectUrl(officerFiling,  urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, req), res,  req);
      }
    } else {
      officerFilingBody.isHomeAddressSameAsServiceAddress = false;
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      return res.redirect(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req));
    }
  } catch (e) {
    next(e);
  }
};

export const buildValidationErrors = (req: Request): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  if (req.body[directorResidentialChoiceHtmlField] === undefined) {
    validationErrors.push(createValidationErrorBasic(whereDirectorLiveResidentialErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED, directorResidentialChoiceHtmlField));
  }
  return validationErrors;
};

const formatDirectorResidentialAddress = (officerFiling: OfficerFiling): string => {
  return formatTitleCase(`
          ${officerFiling.serviceAddress?.premises ? officerFiling.serviceAddress.premises+',' : ""}
          ${officerFiling.serviceAddress?.addressLine1},
          ${officerFiling.serviceAddress?.addressLine2 ? officerFiling.serviceAddress.addressLine2+"," : ""}
          ${officerFiling.serviceAddress?.locality},
          ${officerFiling.serviceAddress?.region ? officerFiling.serviceAddress.region+"," : ""}
          `) + (officerFiling.serviceAddress?.country ? officerFiling.serviceAddress.country : "")
          + officerFiling.serviceAddress?.postalCode
};

const formatDirectorRegisteredOfficeAddress = (companyProfile: CompanyProfile): string => {
  return formatTitleCase(`
          ${companyProfile.registeredOfficeAddress?.premises ? companyProfile.registeredOfficeAddress.premises+',' : ""}
          ${companyProfile.registeredOfficeAddress?.addressLineOne},
          ${companyProfile.registeredOfficeAddress?.addressLineTwo ? companyProfile.registeredOfficeAddress.addressLineTwo+',' : ""}
          ${companyProfile.registeredOfficeAddress?.locality},
          ${companyProfile.registeredOfficeAddress?.region ? companyProfile.registeredOfficeAddress.region+"," : ""}
          ${companyProfile.registeredOfficeAddress?.country ? companyProfile.registeredOfficeAddress.country : ""}
        `) + companyProfile.registeredOfficeAddress?.postalCode
 }
const checkRedirectUrl = (officerFiling: OfficerFiling, nextPageUrl: string, res: Response<any, Record<string, any>>, req: Request) => {
  return officerFiling.checkYourAnswersLink && officerFiling.isServiceAddressSameAsRegisteredOfficeAddress
    ? res.redirect(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req))
    : res.redirect(nextPageUrl);
};

const renderPage = (req: Request, res: Response, officerFiling: OfficerFiling, companyProfile: CompanyProfile, formattedErrors?: FormattedValidationErrors) => {
  return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
    templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS,
    backLinkUrl: getBackLinkUrl(req),
    errors: formattedErrors,
    director_address: officerFiling.directorResidentialAddressChoice,
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    directorRegisteredOfficeAddress: formatDirectorRegisteredOfficeAddress(companyProfile),
    manualAddress: formatDirectorResidentialAddress(officerFiling),
    protectedDetailsBackLink: DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END,
    directorServiceAddressChoice: officerFiling.directorServiceAddressChoice
  });
};
