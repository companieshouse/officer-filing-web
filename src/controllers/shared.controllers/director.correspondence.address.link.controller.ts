import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { createValidationErrorBasic, formatValidationErrors } from '../../validation/validation';
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../services/confirm.company.service";
import { DirectorField } from "../../model/director.model";
import { getDirectorNameForAppointJourney, getField, getDirectorNameForUpdateJourney } from "../../utils/web";
import { Session } from "@companieshouse/node-session-handler";
import { selectLang, getLocalesService, getLocaleInfo, addLangToUrl } from "../../utils/localise";
import { saToRoaErrorMessageKey } from "../../utils/api.enumerations.keys";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsCorrespondenceAddressUpdated } from "../../utils/is.address.updated";

export const getCorrespondenceLink = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const locales = getLocalesService();
    const lang = selectLang(req.query.lang);
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const directorName = isUpdate ?  
      await getDirectorNameForUpdateJourney(session, req, officerFiling) :    
      await getDirectorNameForAppointJourney(officerFiling);

    return res.render(templateName,{
      templateName: templateName,
      backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(backUrlPath, req), lang),
      directorName: formatTitleCase(directorName),
      ...getLocaleInfo(locales, lang),
      currentUrl: req.originalUrl,
      sa_to_roa: calculateSaToRoaRadioFromFiling(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress),
    });
  } catch (e) {
    return next(e);
  }
};

export const postCorrespondenceLink = async (req: Request, res: Response, next: NextFunction, templateName: string, nextPageUrl: NextPageUrl, backUrlPath: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const isServiceAddressSameAsRegisteredOfficeAddress = calculateSaToRoaBooleanValue(req);
    const locales = getLocalesService();
    const lang = selectLang(req.query.lang);

    if (isServiceAddressSameAsRegisteredOfficeAddress === undefined) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const linkError = createValidationErrorBasic(saToRoaErrorMessageKey.SA_TO_ROA_ERROR, DirectorField.SA_TO_ROA_RADIO);
      const directorName = isUpdate ?  
        await getDirectorNameForUpdateJourney(session, req, officerFiling) :    
        await getDirectorNameForAppointJourney(officerFiling);
      return res.render(templateName,{
        templateName: templateName,
        ...getLocaleInfo(locales, lang),
        currentUrl: req.originalUrl,
        backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(backUrlPath, req), lang),
        directorName: formatTitleCase(directorName),
        errors: formatValidationErrors([linkError], lang)
      });
    }

    const officerFilingBody: OfficerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: isServiceAddressSameAsRegisteredOfficeAddress
    };

    if (isUpdate) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const appointmentId = officerFiling.referenceAppointmentId as string;
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      
      officerFilingBody.serviceAddressHasBeenUpdated = checkIsCorrespondenceAddressUpdated(
        { isServiceAddressSameAsRegisteredOfficeAddress: officerFilingBody.isServiceAddressSameAsRegisteredOfficeAddress, serviceAddress: officerFiling.serviceAddress }, 
        companyAppointment);
    }

    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    if (isServiceAddressSameAsRegisteredOfficeAddress) {
      return res.redirect(addLangToUrl(urlUtils.getUrlToPath(nextPageUrl.yes, req), lang));
    } else {
      return res.redirect(addLangToUrl(urlUtils.getUrlToPath(nextPageUrl.no, req), lang));
    }
  } catch (e) {
    next(e);
  }
}

const calculateSaToRoaRadioFromFiling = (saToRoa: boolean | undefined): string | undefined => {
  if (saToRoa === null) {
    return undefined;
  }
  if (saToRoa === true) {
    return DirectorField.SA_TO_ROA_YES;
  }
  if (saToRoa === false) {
    return DirectorField.SA_TO_ROA_NO;
  }
}

export const calculateSaToRoaBooleanValue = (req: Request): boolean|undefined => {
  let saToRoaRadio = getField(req, DirectorField.SA_TO_ROA_RADIO);

  if (!saToRoaRadio) {
    return undefined;
  } 
  if (saToRoaRadio == DirectorField.SA_TO_ROA_YES) {
    return true;
  }
  if (saToRoaRadio == DirectorField.SA_TO_ROA_NO) {
    return false;
  }
  return undefined;
}

export interface NextPageUrl {
  yes: string,
  no: string
}
