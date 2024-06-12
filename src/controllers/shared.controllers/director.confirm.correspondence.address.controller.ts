import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
} from "../../types/page.urls";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../utils/format";
import { Address, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getDirectorNameBasedOnJourney } from "../../utils/web";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { checkIsCorrespondenceAddressUpdated } from "../../utils/is.address.updated";
import { getLocaleInfo, getLocalesService, selectLang, addLangToUrl } from "../../utils/localise";
import { Templates } from "../../types/template.paths";

export const getConfirmCorrespondence = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate?: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    let enterAddressManuallyUrl: string;
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    // Ensure residentialAddress is defined
    const residentialAddress: Address | undefined = officerFiling.residentialAddress;

      if (residentialAddress) {
        residentialAddress.addressLine1 = "";
        residentialAddress.country = "";
      }


    // Check for missing mandatory fields using optional chaining and checking for empty strings
    const isAddressIncomplete = !residentialAddress?.addressLine1?.trim() || !residentialAddress?.country?.trim() || !residentialAddress?.postalCode?.trim();
    console.log("--->>> isAddressIncomplete: " + isAddressIncomplete);
    

    if(isUpdate){
      enterAddressManuallyUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req) + "?backLink=confirm-correspondence-address"
    } else {
      enterAddressManuallyUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req) + "?backLink=confirm-correspondence-address"
    }

    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(backUrlPath, req), lang),
      directorName: formatTitleCase(await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling)),
      enterAddressManuallyUrl: addLangToUrl(enterAddressManuallyUrl, lang),
      isAddressIncomplete,
      ...officerFiling.serviceAddress,
      ...getLocaleInfo(locales, lang),
      currentUrl: req.originalUrl,
    });

  } catch (e) {
    return next(e);
  }
};

export const postConfirmCorrespondence = async (req: Request, res: Response, next: NextFunction, nextPageUrl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const lang = selectLang(req.query.lang);
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const locales = getLocalesService();
    let enterAddressManuallyUrl: string;

    if(isUpdate){
      enterAddressManuallyUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req) + "?backLink=confirm-correspondence-address"
    } else {
      enterAddressManuallyUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, req) + "?backLink=confirm-correspondence-address"
    }
    
    // Ensure residentialAddress is defined
    const residentialAddress: Address | undefined = officerFiling.residentialAddress;

      if (residentialAddress) {
        residentialAddress.addressLine1 = "";
        residentialAddress.country = "";
      }


    // Check for missing mandatory fields using optional chaining and checking for empty strings
    const isAddressIncomplete = !residentialAddress?.addressLine1?.trim() || !residentialAddress?.country?.trim() || !residentialAddress?.postalCode?.trim();
    console.log("--->>> isAddressIncomplete: " + isAddressIncomplete);

    if(isAddressIncomplete){
      return res.render(Templates.UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, {
        templateName: Templates.UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS,
        backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req), lang),
        directorName: formatTitleCase(await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling)),
        enterAddressManuallyUrl: addLangToUrl(enterAddressManuallyUrl, lang),
        isAddressIncomplete,
        ...officerFiling.serviceAddress,
        ...getLocaleInfo(locales, lang),
        currentUrl: req.originalUrl,
      });
    }

    const officerFilingBody: OfficerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: false
    };

    if (isUpdate) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const appointmentId = officerFiling.referenceAppointmentId as string;
      const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      officerFilingBody.serviceAddressHasBeenUpdated = checkIsCorrespondenceAddressUpdated( 
        { isServiceAddressSameAsRegisteredOfficeAddress: officerFilingBody.isServiceAddressSameAsRegisteredOfficeAddress, serviceAddress: officerFiling.serviceAddress }, 
        companyAppointment
      );
    }
    
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    return res.redirect(addLangToUrl(urlUtils.getUrlToPath(nextPageUrl, req), lang));
  }catch(e){
    return next(e);
  }
};
