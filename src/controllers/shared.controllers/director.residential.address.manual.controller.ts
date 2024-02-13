import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import {
  Address,
  OfficerFiling,
} from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getField } from "../../utils/web";
import { DirectorField } from "../../model/director.model";
import { formatValidationErrors } from "../../validation/validation";
import { ValidationError } from "../../model/validation.model";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { COUNTRY_LIST } from "../../utils/properties";
import { validateManualAddress } from "../../validation/manual.address.validation";
import { ResidentialManualAddressValidation } from "../../validation/address.validation.config";
import { checkIsResidentialAddressUpdated } from "../../utils/is.address.updated";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";

export const getResidentialAddressManualEntry = async (req: Request, res: Response, next: NextFunction, templateName: string, backLink: string, confirmResidentialAddress: string) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    const residentialAddressBackParam = urlUtils.getBackLinkFromRequestParams(req);
    let backLinkPath = urlUtils.getUrlToPath(backLink, req);
    if(residentialAddressBackParam && residentialAddressBackParam.includes("confirm-residential-address")) {
      backLinkPath = urlUtils.getUrlToPath(confirmResidentialAddress, req)
    }
    
    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: backLinkPath,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      typeahead_array: COUNTRY_LIST,
      residential_address_premises: officerFiling.residentialAddress?.premises,
      residential_address_line_1: officerFiling.residentialAddress?.addressLine1,
      residential_address_line_2: officerFiling.residentialAddress?.addressLine2,
      residential_address_city: officerFiling.residentialAddress?.locality,
      residential_address_county: officerFiling.residentialAddress?.region,
      typeahead_value: officerFiling.residentialAddress?.country,
      residential_address_postcode: officerFiling.residentialAddress?.postalCode,
      residential_address_back_param: residentialAddressBackParam
    });
  } catch (e) {
    return next(e);
  }
};

export const postResidentialAddressManualEntry = async (req: Request, res: Response, next: NextFunction, templateName: string, backLink: string, nextPagePath: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const originalFiling = await getOfficerFiling(session, transactionId, submissionId);

    const residentialAddress: Address = {
      premises: getField(req, DirectorField.RESIDENTIAL_ADDRESS_PREMISES),
      addressLine1: getField(req, DirectorField.RESIDENTIAL_ADDRESS_ADDRESS_LINE_1),
      addressLine2: getField(req, DirectorField.RESIDENTIAL_ADDRESS_ADDRESS_LINE_2),
      locality: getField(req, DirectorField.RESIDENTIAL_ADDRESS_CITY),
      region: getField(req, DirectorField.RESIDENTIAL_ADDRESS_COUNTY),
      country: getField(req, DirectorField.RESIDENTIAL_ADDRESS_COUNTRY),
      postalCode: getField(req, DirectorField.RESIDENTIAL_ADDRESS_POSTCODE),
    }

    // JS validation
    const jsValidationErrors = validateManualAddress(residentialAddress, ResidentialManualAddressValidation);

    if(jsValidationErrors.length > 0) {
      return renderPage(req, res, residentialAddress, originalFiling, jsValidationErrors, templateName, backLink);
    }
    // Patch filing with updated information
    let officerFilingBody: OfficerFiling = {
      residentialAddress: residentialAddress
    };

    if (isUpdate) {
      const appointmentId = originalFiling.referenceAppointmentId as string;
      const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
      const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);
      officerFilingBody.residentialAddressHasBeenUpdated = checkIsResidentialAddressUpdated(originalFiling, companyAppointment);
    }

    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);
  
    const nextPageUrl = urlUtils.getUrlToPath(nextPagePath, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

export const renderPage = (req: Request, res: Response, residentialAddress: Address, officerFiling: OfficerFiling, validationErrors: ValidationError[], templateName: string, backLink: string) => {
  const formattedErrors = formatValidationErrors(validationErrors);
  return res.render(templateName, {
    templateName: templateName,
    backLinkUrl: urlUtils.getUrlToPath(backLink, req),
    directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    typeahead_array: COUNTRY_LIST,
    residential_address_premises: residentialAddress.premises,
    residential_address_line_1: residentialAddress.addressLine1,
    residential_address_line_2: residentialAddress.addressLine2,
    residential_address_city: residentialAddress.locality,
    residential_address_county: residentialAddress.region,
    typeahead_value: residentialAddress.country,
    residential_address_postcode: residentialAddress.postalCode,
    typeahead_errors: JSON.stringify(formattedErrors),
    errors: formattedErrors,
  });
}