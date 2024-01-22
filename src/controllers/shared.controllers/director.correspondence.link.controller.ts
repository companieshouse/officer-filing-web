import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { createValidationErrorBasic, formatValidationErrors } from '../../validation/validation';
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { formatTitleCase } from "../../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../../utils/format";
import { DirectorField } from "../../model/director.model";
import { getField } from "../../utils/web";
import { Session } from "@companieshouse/node-session-handler";
import { SA_TO_ROA_ERROR } from "../../utils/constants";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH } from "../../types/page.urls";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const getCorrespondenceLink = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string,) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    return res.render(templateName,{
      templateName: templateName,
      backLinkUrl: urlUtils.getUrlToPath(backUrlPath, req),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      sa_to_roa: calculateSaToRoaRadioFromFiling(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress),
    });
  } catch (e) {
    return next(e);
  }
};

export const postCorrespondenceLink = async (req: Request, res: Response, next: NextFunction, templateName: string, nextPageUrl: string, backUrlPath: string) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const isServiceAddressSameAsRegisteredOfficeAddress = calculateSaToRoaBooleanValue(req);

    if (isServiceAddressSameAsRegisteredOfficeAddress === undefined) {
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      const linkError = createValidationErrorBasic(SA_TO_ROA_ERROR, DirectorField.SA_TO_ROA_RADIO);
      return res.render(templateName,{
        templateName: templateName,
        backLinkUrl: urlUtils.getUrlToPath(backUrlPath, req),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        errors: formatValidationErrors([linkError])
      });
    }

    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyProfile = await getCompanyProfile(companyNumber);
    const validateRoa = validateRegisteredOfficeAddress(companyProfile)
    if (!validateRoa) {
      nextPageUrl = isServiceAddressSameAsRegisteredOfficeAddress ? DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH : 
      DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH;
    }

    const officerFilingBody: OfficerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: isServiceAddressSameAsRegisteredOfficeAddress

    };
    await patchOfficerFiling(session, transactionId, submissionId, officerFilingBody);

    return res.redirect(urlUtils.getUrlToPath(nextPageUrl, req));
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

const validateRegisteredOfficeAddress = (companyProfile: CompanyProfile): boolean => {
  const registeredOfficeAddress = mapCompanyProfileToOfficerFilingAddress(companyProfile.registeredOfficeAddress);
  if (registeredOfficeAddress !== undefined) {
    return true;
  } else {
    return false;
  }
}
