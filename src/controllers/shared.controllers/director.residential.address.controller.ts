import { NextFunction, Request, Response } from "express";
import { DIRECTOR_PROTECTED_DETAILS_PATH,
         DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
         DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
         APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
         UPDATE_DIRECTOR_CHECK_ANSWERS_PATH,
         UPDATE_DIRECTOR_DETAILS_PATH,
         UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
         UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH
      } from '../../types/page.urls';
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { whereDirectorLiveResidentialErrorMessageKey } from '../../utils/api.enumerations.keys';
import { createValidationErrorBasic, formatValidationErrors } from '../../validation/validation';
import { FormattedValidationErrors, ValidationError } from "../../model/validation.model";
import { getOfficerFiling, patchOfficerFiling } from '../../services/officer.filing.service';
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ResidentialManualAddressValidation } from "../../validation/address.validation.config";
import { validateManualAddress } from "../../validation/manual.address.validation";
import { logger } from "../../utils/logger";

const directorResidentialChoiceHtmlField: string = "director_address";

export const getDirectorResidentialAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string) => {
  try {
    const { officerFiling, companyProfile } = await urlUtilsRequestParams(req);
    return renderPage(req, res, officerFiling, companyProfile, templateName, backUrlPath);
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

export const postDirectorResidentialAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try {
    const selectedSraAddressChoice = req.body[directorResidentialChoiceHtmlField];
    const { officerFiling, companyProfile, transactionId, session, submissionId } = await urlUtilsRequestParams(req);
    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return renderPage(req, res, officerFiling, companyProfile, templateName, backUrlPath, formattedErrors);
    }

    const officerFilingBody: OfficerFiling = {
      directorResidentialAddressChoice: selectedSraAddressChoice
    };
    if (selectedSraAddressChoice === "director_registered_office_address") {
      officerFilingBody.isHomeAddressSameAsServiceAddress = false;
      officerFilingBody.residentialAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
      const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

      if (isUpdate){
        return patchFiling.data.checkYourAnswersLink
          ? res.redirect(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, req))
          : res.redirect(urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req));
      } else {
      return patchFiling.data.checkYourAnswersLink
        ? res.redirect(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req))
        : res.redirect(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req));
      }

    } else if (selectedSraAddressChoice === "director_correspondence_address") {
      officerFilingBody.residentialAddress = officerFiling.serviceAddress;
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

      if(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress){
        if (isUpdate) {
            return checkRedirectUrl(officerFiling, urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req), res, req);
        }
        return checkRedirectUrl(officerFiling, urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req), res, req);
      }
      else{
        if (isUpdate) {
            return checkRedirectUrl(officerFiling, urlUtils.getUrlToPath(UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, req), res, req);
        }
        return checkRedirectUrl(officerFiling, urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, req), res, req);
      }
    } else {
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      if (isUpdate) {
        return res.redirect(urlUtils.getUrlToPath(UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req));
      }
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

const renderPage = (req: Request, res: Response, officerFiling: OfficerFiling, companyProfile: CompanyProfile, templateName: string, backUrlPath: string, formattedErrors?: FormattedValidationErrors) => {
  const registeredOfficeAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
  let canUseRegisteredOfficeAddress = false;
  if (registeredOfficeAddress !== undefined) {
      const registeredOfficeAddressAsCorrespondenceAddressErrors = validateManualAddress(registeredOfficeAddress, ResidentialManualAddressValidation);
      if (registeredOfficeAddressAsCorrespondenceAddressErrors.length === 0) {
        canUseRegisteredOfficeAddress = true;
      }
  }
  logger.debug((canUseRegisteredOfficeAddress ? "Can" : "Can't") + " use registered office address copy for residential address");

  return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
    templateName: templateName,
    backLinkUrl: urlUtils.getUrlToPath(backUrlPath, req),
    errors: formattedErrors,
    director_address: officerFiling.directorResidentialAddressChoice,
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    directorRegisteredOfficeAddress: formatDirectorRegisteredOfficeAddress(companyProfile),
    manualAddress: formatDirectorResidentialAddress(officerFiling),
    directorServiceAddressChoice: officerFiling.directorServiceAddressChoice,
    canUseRegisteredOfficeAddress
  });
};
