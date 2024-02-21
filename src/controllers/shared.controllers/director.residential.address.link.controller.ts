import { NextFunction, Request, Response } from "express";
import {
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
  UPDATE_DIRECTOR_CHECK_ANSWERS_PATH,
  UPDATE_DIRECTOR_DETAILS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH } from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { createValidationErrorBasic, formatValidationErrors } from '../../validation/validation';
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../services/confirm.company.service";
import { DirectorField } from "../../model/director.model";
import { getDirectorNameBasedOnJourney, getField } from "../../utils/web";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsResidentialAddressUpdated } from "../../utils/is.address.updated";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";

export const getResidentialLink = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
    const locales = getLocalesService();
    const lang = selectLang(req.query.lang);
    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(backUrlPath, req), lang),
      directorName: formatTitleCase(directorName),
      ha_to_sa: calculateHaToSaRadioFromFiling(officerFiling.isHomeAddressSameAsServiceAddress),
      ...getLocaleInfo(locales, lang),
      currentUrl: getCurrentUrl(isUpdate, req)
    });
  } catch (e) {
    return next(e);
  }
};

export const postResidentialLink = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const isHomeAddressSameAsServiceAddress = calculateHaToSaBooleanValue(req);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const localeInfo = getLocaleInfo(locales, lang)

    if (isHomeAddressSameAsServiceAddress === undefined) {
      const linkError = createValidationErrorBasic("residential-address-to-correspondence-address-link-no-radio-selected", DirectorField.HA_TO_SA_RADIO);
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
      return res.render(templateName, {
        templateName: templateName,
        backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(backUrlPath, req), lang),
        directorName: formatTitleCase(directorName),
        errors: formatValidationErrors([linkError], lang),
        ...localeInfo,
        currentUrl: getCurrentUrl(isUpdate, req)
      });
    }

    const officerFilingBody: OfficerFiling = {
      isHomeAddressSameAsServiceAddress: isHomeAddressSameAsServiceAddress
    };

    if (isUpdate) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const appointmentId = officerFiling.referenceAppointmentId as string;
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      officerFilingBody.residentialAddressHasBeenUpdated = checkIsResidentialAddressUpdated(
        { isHomeAddressSameAsServiceAddress: officerFilingBody.isHomeAddressSameAsServiceAddress, residentialAddress: officerFiling.residentialAddress }, 
        companyAppointment
      );
    }

    const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
    
    if (patchFiling.data.checkYourAnswersLink) {
      return res.redirect(addLangToUrl(urlUtils.getUrlToPath(getCheckYourAnswersLink(isUpdate), req), lang));
    }
    return res.redirect(addLangToUrl(urlUtils.getUrlToPath(getRedirectLink(isUpdate), req), lang));
  } catch (e) {
    next(e);
  }
}

const calculateHaToSaRadioFromFiling = (haToSa: boolean | undefined): string | undefined => {
  if (haToSa === null) {
    return undefined;
  }
  if (haToSa === true) {
    return DirectorField.HA_TO_SA_YES;
  }
  if (haToSa === false) {
    return DirectorField.HA_TO_SA_NO;
  }
}

export const calculateHaToSaBooleanValue = (req: Request): boolean|undefined => {
  let haToSaRadio = getField(req, DirectorField.HA_TO_SA_RADIO);

  if (!haToSaRadio) {
    return undefined;
  } 
  if (haToSaRadio == DirectorField.HA_TO_SA_YES) {
    return true;
  }
  if (haToSaRadio == DirectorField.HA_TO_SA_NO) {
    return false;
  }
  return undefined;
}

const getCheckYourAnswersLink = (isUpdate: boolean): string => {
  if(isUpdate){
    return UPDATE_DIRECTOR_CHECK_ANSWERS_PATH;
  }
  return APPOINT_DIRECTOR_CHECK_ANSWERS_PATH;
}

const getRedirectLink = (isUpdate: boolean): string => {
  if(isUpdate){
    return UPDATE_DIRECTOR_DETAILS_PATH;
  }
  return DIRECTOR_PROTECTED_DETAILS_PATH;
}

const getCurrentUrl = (isUpdate: boolean, req: Request) => {
  if(isUpdate){
    return urlUtils.getUrlToPath(UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, req)
  }
  return urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, req)
}
