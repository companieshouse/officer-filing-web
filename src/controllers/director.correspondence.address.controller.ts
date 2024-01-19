import { NextFunction, Request, Response } from "express";
import { 
  DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH, 
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  DIRECTOR_OCCUPATION_PATH, 
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { createValidationErrorBasic, formatValidationErrors } from "../validation/validation";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { ValidationError } from "../model/validation.model";
import { whereDirectorLiveCorrespondenceErrorMessageKey } from "../utils/api.enumerations.keys";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { urlUtilsRequestParams } from "./director.residential.address.controller";
import { setBackLink } from "../utils/web";
import { validateManualAddress } from "../validation/manual.address.validation";
import { CorrespondenceManualAddressValidation } from "../validation/address.validation.config";
import { logger } from "../utils/logger";

const directorChoiceHtmlField: string = "director_correspondence_address";
const registeredOfficerAddressValue: string = "director_registered_office_address";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { officerFiling, companyProfile } = await urlUtilsRequestParams(req);
    return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, {
      templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS,
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req)),
      optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
      director_correspondence_address: officerFiling.directorServiceAddressChoice,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      directorRegisteredOfficeAddress: formatDirectorRegisteredAddress(companyProfile),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try{
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const selectedSraAddressChoice = req.body[directorChoiceHtmlField];

    const companyProfile = await getCompanyProfile(companyNumber);

    const validationErrors = buildResidentialAddressValidationErrors(req);
    if (validationErrors.length > 0) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, {
        templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS,
        backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req)),
        errors: formattedErrors,
        director_correspondence_address: officerFiling.directorServiceAddressChoice,
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        directorRegisteredOfficeAddress: formatDirectorRegisteredAddress(companyProfile),
      });
    }

    const officerFilingBody: OfficerFiling = {
      directorServiceAddressChoice: selectedSraAddressChoice,
      serviceAddress: undefined
    };

    const canUseRegisteredOfficeAddress = verifyUseRegisteredOfficeAddress(selectedSraAddressChoice, companyProfile, officerFilingBody);
    
    const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    if (!canUseRegisteredOfficeAddress && selectedSraAddressChoice === registeredOfficerAddressValue) {
      return res.redirect(urlUtils.getUrlToPath(DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH, req));
    }
    
    if (patchFiling.data.isHomeAddressSameAsServiceAddress && selectedSraAddressChoice === registeredOfficerAddressValue) {
      return res.redirect(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req));
    }
    else if (!patchFiling.data.isHomeAddressSameAsServiceAddress && selectedSraAddressChoice === registeredOfficerAddressValue) {
      return res.redirect(urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH, req));
    }
    else {
      officerFilingBody.isServiceAddressSameAsRegisteredOfficeAddress = false;
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      return res.redirect(urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req));
    }

  } catch(e) {
    next(e);
  }
};

const verifyUseRegisteredOfficeAddress = (selectedSraAddressChoice: string, companyProfile: CompanyProfile, officerFilingBody: OfficerFiling): Boolean => {
  let useRegisteredOfficeAddress = false;
  if (selectedSraAddressChoice === registeredOfficerAddressValue) {
    const registeredOfficeAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
    if (registeredOfficeAddress !== undefined) {
      const registeredOfficeAddressAsCorrespondenceAddressErrors = validateManualAddress(registeredOfficeAddress, CorrespondenceManualAddressValidation);
      if (registeredOfficeAddressAsCorrespondenceAddressErrors.length === 0) {
        useRegisteredOfficeAddress = true;
        officerFilingBody.serviceAddress = registeredOfficeAddress;
      }
    }
    logger.debug((useRegisteredOfficeAddress ? "Can" : "Can't") + " use registered office address copy for correspondence address");
  }

  return useRegisteredOfficeAddress;
};

export const buildResidentialAddressValidationErrors = (req: Request): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  if (req.body[directorChoiceHtmlField] === undefined) {
    validationErrors.push(createValidationErrorBasic(whereDirectorLiveCorrespondenceErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED, directorChoiceHtmlField));
  }
  return validationErrors;
};

const formatDirectorRegisteredAddress = (companyProfile: CompanyProfile) => {
  return formatTitleCase(`
          ${companyProfile.registeredOfficeAddress?.premises ? companyProfile.registeredOfficeAddress.premises+',' : ""}
          ${companyProfile.registeredOfficeAddress?.addressLineOne},
          ${companyProfile.registeredOfficeAddress?.addressLineTwo ? companyProfile.registeredOfficeAddress.addressLineTwo+',' : ""}
          ${companyProfile.registeredOfficeAddress?.locality},
          ${companyProfile.registeredOfficeAddress?.region ? companyProfile.registeredOfficeAddress.region+"," : ""}
          ${companyProfile.registeredOfficeAddress?.country ? companyProfile.registeredOfficeAddress.country : ""}
        `) + companyProfile.registeredOfficeAddress?.postalCode
 }
