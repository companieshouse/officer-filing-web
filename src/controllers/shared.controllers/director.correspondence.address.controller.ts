import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatDirectorRegisteredOfficeAddress, formatTitleCase } from "../../utils/format";
import { formatValidationErrors } from "../../validation/validation";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { ValidationError, GenericValidationType } from '../../model/validation.model';
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { urlUtilsRequestParams } from "../shared.controllers/director.residential.address.controller";
import { setBackLink, getDirectorNameBasedOnJourney } from "../../utils/web";
import { validateManualAddress } from "../../validation/manual.address.validation";
import { CorrespondenceManualAddressValidation } from "../../validation/address.validation.config";
import { logger } from "../../utils/logger";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang} from "../../utils/localise";
import { DirectorField } from "../../model/director.model";
import { CorrespondenceAddressValidation } from "../../validation/director.correspondence.address.config";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsCorrespondenceAddressUpdated } from "../../utils/is.address.updated";

const directorChoiceHtmlField: string = DirectorField.CORRESPONDENCE_ADDRESS_RADIO;
const registeredOfficerAddressValue: string = "director_registered_office_address";

export const getDirectorCorrespondenceAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const { officerFiling, companyProfile, session } = await urlUtilsRequestParams(req);
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);

    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: addLangToUrl(setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(backUrlPath, req)), lang),
      optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
      director_correspondence_address: officerFiling.directorServiceAddressChoice,
      directorName: formatTitleCase(directorName),
      directorRegisteredOfficeAddress: formatDirectorRegisteredOfficeAddress(companyProfile),
      ...getLocaleInfo(locales, lang),
      currentUrl: getCurrentUrl(req, isUpdate, lang),
      lang
    });
  } catch (e) {
    return next(e);
  }
};

export const postDirectorCorrespondenceAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try{
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const session: Session = req.session as Session;
    const lang = selectLang(req.query.lang);

    const selectedSraAddressChoice = req.body[directorChoiceHtmlField];

    const companyProfile = await getCompanyProfile(companyNumber);

    const validationErrors = buildResidentialAddressValidationErrors(req, CorrespondenceAddressValidation);

    if (validationErrors.length > 0) {
      const locales = getLocalesService();
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const formattedErrors = formatValidationErrors(validationErrors, lang);
      const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);

      return res.render(templateName, {
        templateName: templateName,
        backLinkUrl: addLangToUrl(setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(backUrlPath, req)), lang),
        errors: formattedErrors,
        director_correspondence_address: officerFiling.directorServiceAddressChoice,
        directorName: formatTitleCase(directorName),
        directorRegisteredOfficeAddress: formatDirectorRegisteredOfficeAddress(companyProfile),
        ...getLocaleInfo(locales, lang),
        currentUrl: getCurrentUrl(req, isUpdate, lang),
        lang
      });
    }

    const officerFilingBody: OfficerFiling = {
      directorServiceAddressChoice: selectedSraAddressChoice,
      serviceAddress: undefined
    };

    const canUseRegisteredOfficeAddress = verifyUseRegisteredOfficeAddress(selectedSraAddressChoice, companyProfile, officerFilingBody);
    if (canUseRegisteredOfficeAddress && isUpdate) {

      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const appointmentId = officerFiling.referenceAppointmentId as string;
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

      officerFilingBody.serviceAddressHasBeenUpdated = checkIsCorrespondenceAddressUpdated(
        { isServiceAddressSameAsRegisteredOfficeAddress: officerFiling.isServiceAddressSameAsRegisteredOfficeAddress, serviceAddress: officerFilingBody.serviceAddress }, 
        companyAppointment);
    }

    const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
   
    return getRedirectPath(canUseRegisteredOfficeAddress, selectedSraAddressChoice, isUpdate, patchFiling, req, res, lang);
   
  } catch(e) {
    next(e);
  }
};

const getRedirectPath = (canUseRegisteredOfficeAddress, selectedSraAddressChoice, isUpdate, patchFiling, req, res, lang) => {
  let path: string;

  if (!canUseRegisteredOfficeAddress && selectedSraAddressChoice === registeredOfficerAddressValue) {
    path = isUpdate ? UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH : DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH;
    return redirectToPath(path, req, res, lang);
  }

  if (patchFiling.data.isHomeAddressSameAsServiceAddress && selectedSraAddressChoice === registeredOfficerAddressValue) {
    path = isUpdate ? UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH : DIRECTOR_RESIDENTIAL_ADDRESS_PATH;
    return redirectToPath(path, req, res, lang);
  }

  if (!patchFiling.data.isHomeAddressSameAsServiceAddress && selectedSraAddressChoice === registeredOfficerAddressValue) {
    path = isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH;
    return redirectToPath(path, req, res, lang);
  }

  path = isUpdate ? UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH : DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH;
  return redirectToPath(path, req, res, lang);
};

const redirectToPath = (path: string, req: Request, res: Response, lang: string) => {
    return res.redirect(addLangToUrl(urlUtils.getUrlToPath(path, req), lang));
};

const verifyUseRegisteredOfficeAddress = (selectedSraAddressChoice: string, companyProfile: CompanyProfile, officerFilingBody: OfficerFiling): boolean => {
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

export const buildResidentialAddressValidationErrors = (req: Request, correspondenceAddressValidationType: GenericValidationType): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  if (req.body[directorChoiceHtmlField] === undefined) {
    validationErrors.push(correspondenceAddressValidationType.AddressBlank.ErrorField);
  }
  return validationErrors;
};

 const getCurrentUrl = (req: Request, isUpdate: boolean, lang: string): string => {
  if(isUpdate){
      return addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req), lang)
    } else {
      return addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req), lang)
  }
}
