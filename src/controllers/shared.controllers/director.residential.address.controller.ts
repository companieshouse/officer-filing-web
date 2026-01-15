import { NextFunction, Request, Response } from "express";
import { DIRECTOR_PROTECTED_DETAILS_PATH,
         DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
         DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
         APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
         UPDATE_DIRECTOR_CHECK_ANSWERS_PATH,
         UPDATE_DIRECTOR_DETAILS_PATH,
         UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
         UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
         DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
         UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH
      } from '../../types/page.urls';
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { createValidationError, formatValidationErrors } from '../../validation/validation';
import { ValidationError } from "../../model/validation.model";
import { getOfficerFiling, patchOfficerFiling } from '../../services/officer.filing.service';
import { Session } from "@companieshouse/node-session-handler";
import { formatAddress, formatDirectorRegisteredOfficeAddress, formatTitleCase } from "../../utils/format";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../../services/company.profile.service";
import { ResidentialManualAddressValidation } from "../../validation/address.validation.config";
import { validateManualAddress } from "../../validation/manual.address.validation";
import { logger } from "../../utils/logger";
import { getAppointDirectorNameBasedOnJourney, getUpdateDirectorNameBasedOnJourney } from "../../utils/web";
import { RenderAddressRadioParams } from "../../utils/render.page.params";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsResidentialAddressUpdated } from "../../utils/is.address.updated";
import { getLocalesService, selectLang, getLocaleInfo, addLangToUrl } from '../../utils/localise';

const directorResidentialChoiceHtmlField: string = "director_address";

export const getDirectorResidentialAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try {
    const { officerFiling, companyProfile, session } = await urlUtilsRequestParams(req);
    const directorName = isUpdate ? 
      await getUpdateDirectorNameBasedOnJourney(session, req, officerFiling) : 
      await getAppointDirectorNameBasedOnJourney(officerFiling);
    return renderPage(req, res, {
      officerFiling: officerFiling,
      companyProfile: companyProfile,
      templateName: templateName,
      backUrlPath: backUrlPath,
      directorName: directorName,
    }, isUpdate);
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
    const lang = selectLang(req.query.lang);
    const selectedSraAddressChoice = req.body[directorResidentialChoiceHtmlField];
    const { officerFiling, companyProfile, transactionId, session, submissionId } = await urlUtilsRequestParams(req);
    const directorName = isUpdate ? 
      await getUpdateDirectorNameBasedOnJourney(session, req, officerFiling) : 
      await getAppointDirectorNameBasedOnJourney(officerFiling);
    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors, lang);
      return renderPage(req, res, {
        officerFiling: officerFiling,
        companyProfile: companyProfile,
        templateName: templateName,
        backUrlPath: backUrlPath,
        directorName: directorName,
        formattedErrors: formattedErrors}, 
        isUpdate);
    }

    const appointmentId = officerFiling.referenceAppointmentId as string;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const officerFilingBody: OfficerFiling = {
      directorResidentialAddressChoice: selectedSraAddressChoice
    };

    if (selectedSraAddressChoice === "director_registered_office_address") {
      officerFilingBody.isHomeAddressSameAsServiceAddress = false;
      officerFilingBody.residentialAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
     
      if (isUpdate) {
        const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
        officerFilingBody.residentialAddressHasBeenUpdated = checkIsResidentialAddressUpdated(
          { isHomeAddressSameAsServiceAddress: officerFilingBody.isHomeAddressSameAsServiceAddress, residentialAddress: officerFilingBody.residentialAddress },
          companyAppointment
        );
      }

      const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

      if (isUpdate) {
        setUpdateRedirectROASelected(res, req, patchFiling.data, lang);
      
      } else {
        setAppointRedirectROASelected(res, req, patchFiling.data, lang);
      }

    } else if (selectedSraAddressChoice === "director_correspondence_address") {
      officerFilingBody.residentialAddress = officerFiling.serviceAddress;
      
      if (isUpdate) {
        const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
        officerFilingBody.residentialAddressHasBeenUpdated = checkIsResidentialAddressUpdated(
          { isHomeAddressSameAsServiceAddress: officerFiling.isHomeAddressSameAsServiceAddress, residentialAddress: officerFilingBody.residentialAddress },
          companyAppointment
        );
      }

      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      setRedirectCorrespondenceAddressSelected(isUpdate, res, req, officerFiling, lang);

    } else {
      await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
      if (isUpdate) {
        return res.redirect(addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req),lang));
      }
      return res.redirect(addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req), lang));
    }
  } catch (e) {
    next(e);
  }
};

export const buildValidationErrors = (req: Request): ValidationError[] => {
  const displayedAddress = req.body["correspondence_address_display"];
  const validationErrors: ValidationError[] = [];
  if (req.body[directorResidentialChoiceHtmlField] === undefined) {
    validationErrors.push(createValidationError("residential-address-blank", [directorResidentialChoiceHtmlField], displayedAddress));
  }
  return validationErrors;
};

const formatDirectorServiceAddress = (officerFiling: OfficerFiling): string => {
  const address = officerFiling.serviceAddress;
  return formatAddress([
    formatTitleCase(address?.premises),
    formatTitleCase(address?.addressLine1),
    formatTitleCase(address?.addressLine2),
    formatTitleCase(address?.locality),
    formatTitleCase(address?.region),
    formatTitleCase(address?.country),
    address?.postalCode?.toUpperCase()
  ]);
};

const checkRedirectUrl = (officerFiling: OfficerFiling, nextPageUrl: string, res: Response<any, Record<string, any>>, req: Request, lang: string) => {
  return officerFiling.checkYourAnswersLink && officerFiling.isServiceAddressSameAsRegisteredOfficeAddress
    ? res.redirect(addLangToUrl(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req), lang))
    : res.redirect(addLangToUrl((nextPageUrl), lang));
};

const renderPage = (req: Request, res: Response, params: RenderAddressRadioParams, isUpdate: boolean) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const registeredOfficeAddress = mapCompanyProfileToOfficerFilingAddress(params.companyProfile.registeredOfficeAddress);
  let canUseRegisteredOfficeAddress = false;
  if (registeredOfficeAddress !== undefined) {
      const registeredOfficeAddressAsCorrespondenceAddressErrors = validateManualAddress(registeredOfficeAddress, ResidentialManualAddressValidation);
      if (registeredOfficeAddressAsCorrespondenceAddressErrors.length === 0) {
        canUseRegisteredOfficeAddress = true;
      }
  }
  logger.debug((canUseRegisteredOfficeAddress ? "Can" : "Can't") + " use registered office address copy for residential address");

  return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
    templateName: params.templateName,
    backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(params.backUrlPath, req), lang),
    errors: params.formattedErrors,
    director_address: params.officerFiling.directorResidentialAddressChoice,
    directorName: formatTitleCase(params.directorName),
    directorRegisteredOfficeAddress: formatDirectorRegisteredOfficeAddress(params.companyProfile),
    manualAddress: formatDirectorServiceAddress(params.officerFiling),
    directorServiceAddressChoice: params.officerFiling.directorServiceAddressChoice,
    canUseRegisteredOfficeAddress,
    ...getLocaleInfo(locales, lang),
    currentUrl : isUpdate ? getUpdateUrl(req, lang) : getAppointUrl(req, lang),
  });
};

const setAppointRedirectROASelected = (res: Response<any, Record<string, any>>, req: Request, data: OfficerFiling, lang: string) => {
  return getAppointLink(req, res, data, lang);
}

const setUpdateRedirectROASelected = (res: Response<any, Record<string, any>>, req: Request, data: OfficerFiling, lang: string) => {
  return getUpdateLink(req,  res, data, lang);
}

const getUpdateLink = (req: Request, res: Response<any, Record<string, any>>, data: OfficerFiling, lang: string) => {
  return data.checkYourAnswersLink
    ? res.redirect(addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, req), lang))
      : res.redirect(addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req), lang));
}

const getAppointLink = (req: Request, res: Response<any, Record<string, any>>, data: OfficerFiling, lang: string) => {
  return data.checkYourAnswersLink
    ? res.redirect(addLangToUrl(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req), lang))
      : res.redirect(addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req), lang));
}


const setRedirectCorrespondenceAddressSelected = (isUpdate: boolean, res: Response<any, Record<string, any>>, req: Request, officerFiling: OfficerFiling, lang: string) => {
    if(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress){
        if (isUpdate) {
            return checkRedirectUrl(officerFiling, addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req), lang), res, req, lang);
        }
        return checkRedirectUrl(officerFiling, addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req), lang), res, req, lang);
    } else {
        if (isUpdate) {
            return checkRedirectUrl(officerFiling, addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, req), lang), res, req, lang);
        }
        return checkRedirectUrl(officerFiling, addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, req), lang), res, req, lang);
    }
}

const getAppointUrl = (req: Request, lang: string): string => {
    return addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req), lang)
}

const getUpdateUrl = (req: Request, lang: string): string => {
    return addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req), lang)
}