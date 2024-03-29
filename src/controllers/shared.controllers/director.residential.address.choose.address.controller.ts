import { NextFunction, Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { getUKAddressesFromPostcode } from "../../services/postcode.lookup.service";
import { POSTCODE_ADDRESSES_LOOKUP_URL } from "../../utils/properties";
import { formatTitleCase } from "../../utils/format";
import {getAddressOptions, getCountryFromKey, getDirectorNameBasedOnJourney, setBackLink} from "../../utils/web";
import { RenderArrayPageParams } from "../../utils/render.page.params";
import {
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH
} from "../../types/page.urls";
import { createValidationError, formatValidationErrors} from "../../validation/validation";
import { DirectorField } from "../../model/director.model";
import { residentialAddressErrorMessageKey } from "../../utils/api.enumerations.keys";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { checkIsResidentialAddressUpdated } from "../../utils/is.address.updated";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";

export const getResidentialAddressChooseAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkPath: string, isUpdate: boolean) => {
  try {
    const session: Session = req.session as Session;
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);

    const postalCode = officerFiling?.residentialAddress?.postalCode;
    if(!postalCode) {
      throw new Error("Postal code is undefined");
    }

    const ukAddresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postalCode.replace(/\s/g, ''));

    return renderPage(req, res, {
      officerFiling: officerFiling,
      ukAddresses: ukAddresses,
      validationErrors: [],
      directorName: directorName,
      templateName: templateName,
      backUrlPath: backLinkPath,
      isUpdate: isUpdate
    });

  } catch (e) {
    return next(e);
  }
};

export const postResidentialAddressChooseAddress = async (req: Request, res: Response, next: NextFunction, templateName: string, backLinkPath: string, nextPagePath: string, isUpdate: boolean) => {
  const session: Session = req.session as Session;
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const lang = selectLang(req.query.lang);

  const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
  const directorName = await getDirectorNameBasedOnJourney(isUpdate, session, req, officerFiling);
  const confirmResidentialAddressUrl = addLangToUrl(urlUtils.getUrlToPath(nextPagePath, req), lang);

  const postalCode = officerFiling?.residentialAddress?.postalCode ?? '';
  const addresses: UKAddress[] = await getUKAddressesFromPostcode(POSTCODE_ADDRESSES_LOOKUP_URL, postalCode.replace(/\s/g, ''));
  const selectedPremises = req.body[DirectorField.ADDRESS_ARRAY];
  const selectedAddress = addresses.find((address: UKAddress) => address.premise === selectedPremises);

  if(!selectedAddress) {
    const validationError = createValidationError(residentialAddressErrorMessageKey.RESIDENTIAL_ADDRESS_BLANK, [DirectorField.ADDRESS_ARRAY], addresses[0]?.premise);
    return renderPage(req, res, {
      officerFiling,
      ukAddresses: addresses,
      validationErrors: [validationError],
      directorName: directorName,
      templateName: templateName,
      backUrlPath: backLinkPath,
      isUpdate: isUpdate
    });
  }

  const patchFiling: OfficerFiling = {
    residentialAddress: {
      premises: selectedAddress.premise,
      addressLine1: selectedAddress.addressLine1,
      addressLine2: selectedAddress.addressLine2,
      locality: selectedAddress.postTown,
      country: getCountryFromKey(selectedAddress.country),
      postalCode: selectedAddress.postcode
    }
  };

  if (isUpdate) {
    const appointmentId = officerFiling.referenceAppointmentId as string;
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
    patchFiling.residentialAddressHasBeenUpdated = checkIsResidentialAddressUpdated(
      { isHomeAddressSameAsServiceAddress: officerFiling.isHomeAddressSameAsServiceAddress, residentialAddress: patchFiling.residentialAddress }, 
      companyAppointment
    );
  }

  await patchOfficerFiling(session, transactionId, submissionId, patchFiling);

  return res.redirect(confirmResidentialAddressUrl);
}

const renderPage = async (req: Request, res: Response, params: RenderArrayPageParams) => {
  const residentialManualAddressPath = params.isUpdate ? UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH : DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH;
  const addressOptions = getAddressOptions(params.ukAddresses);
  const locales = getLocalesService();
  const lang = selectLang(req.query.lang);

  return res.render(params.templateName, {
    templateName: params.templateName,
    backLinkUrl: setBackLink(req, params.officerFiling.checkYourAnswersLink, addLangToUrl(urlUtils.getUrlToPath(params.backUrlPath, req), lang)),
    enterAddressManuallyUrl: addLangToUrl(urlUtils.getUrlToPath(residentialManualAddressPath, req), lang),
    directorName: formatTitleCase(params.directorName),
    addresses: addressOptions,
    currentPremises: params.officerFiling.residentialAddress?.premises,
    errors: formatValidationErrors(params.validationErrors, lang),
    ...getLocaleInfo(locales, lang),
    currentUrl : req.originalUrl
  });

}