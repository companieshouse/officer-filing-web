import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../utils/format";
import { getDirectorNameBasedOnJourney } from "../../utils/web";
import { Address, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsResidentialAddressUpdated } from "../../utils/is.address.updated";
import { getLocaleInfo, getLocalesService, selectLang, addLangToUrl } from "../../utils/localise";
import { DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { validateManualAddress } from "validation/manual.address.validation";
import { ResidentialManualAddressValidation } from "validation/address.validation.config";

export const getDirectorConfirmResidentialAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, manualEntryUrl: string, isUpdate: boolean) => {
  try {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
    const manualEntryUrlWithBackLink = manualEntryUrl+"?backLink=confirm-residential-address";

    const residentialAddress: Address | undefined = officerFiling.residentialAddress;

    if (residentialAddress) {
        residentialAddress.addressLine1 = "";
        residentialAddress.country = "";
    }
    // JS validation
    const jsValidationErrors = residentialAddress ? validateManualAddress(residentialAddress, ResidentialManualAddressValidation) : [];
    
    console.log("---->>> jsValidationErrors" + jsValidationErrors);

    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(backUrlPath, req), lang),
      directorName: formatTitleCase(directorName),
      enterAddressManuallyUrl: addLangToUrl(urlUtils.getUrlToPath(manualEntryUrlWithBackLink, req), lang),
      validationErrors: jsValidationErrors,
      ...officerFiling.residentialAddress,
      ...getLocaleInfo(locales, lang),
      currentUrl: getCurrentUrl(req, isUpdate, lang),
    });
  } catch (e) {
    return next(e);
  }
};

export const postDirectorConfirmResidentialAddress = async (req: Request, res: Response, next: NextFunction, checkYourAnswersLink: string, nextPageurl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
    const manualEntryUrlWithBackLink = DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH+"?backLink=confirm-residential-address";

    const residentialAddress: Address | undefined = officerFiling.residentialAddress;

    if (residentialAddress) {
        residentialAddress.addressLine1 = "";
        residentialAddress.country = "";
    }
    // JS validation
    const jsValidationErrors = residentialAddress ? validateManualAddress(residentialAddress, ResidentialManualAddressValidation) : [];

    console.log("---->>> jsValidationErrors" + jsValidationErrors);

    if(jsValidationErrors.length > 0) {
        return res.render(Templates.UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, {
          templateName: Templates.UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS,
          backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req), lang),
          directorName: formatTitleCase(directorName),
          enterAddressManuallyUrl: addLangToUrl(urlUtils.getUrlToPath(manualEntryUrlWithBackLink, req), lang),
          validationErrors: jsValidationErrors,
          ...officerFiling.residentialAddress,
          ...getLocaleInfo(locales, lang),
          currentUrl: getCurrentUrl(req, isUpdate, lang),
        });
      }

    const officerFilingBody: OfficerFiling = {
      isHomeAddressSameAsServiceAddress: false
    };

    if (isUpdate) {
      const appointmentId = officerFiling.referenceAppointmentId as string;
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      officerFilingBody.residentialAddressHasBeenUpdated = checkIsResidentialAddressUpdated(
        { isHomeAddressSameAsServiceAddress: officerFilingBody.isHomeAddressSameAsServiceAddress, residentialAddress: officerFiling.residentialAddress },
        companyAppointment
      );
    }

    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    if (officerFiling.checkYourAnswersLink) {
      return res.redirect(addLangToUrl(urlUtils.getUrlToPath(checkYourAnswersLink, req), lang));
    }
    return res.redirect(addLangToUrl(urlUtils.getUrlToPath(nextPageurl, req), lang));
  } catch (e) {
    return next(e);
  }
};

const getCurrentUrl = (req: Request, isUpdate: boolean, lang: string): string => {
  if(isUpdate){
      return addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req), lang)
    } else {
      return addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req), lang)
  }
}