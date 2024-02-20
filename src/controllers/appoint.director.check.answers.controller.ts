import { NextFunction, Request, Response } from "express";
import { DIRECTOR_PROTECTED_DETAILS_PATH, APPOINT_DIRECTOR_SUBMITTED_PATH, CURRENT_DIRECTORS_PATH, URL_QUERY_PARAM, BASIC_STOP_PAGE_PATH, DIRECTOR_NAME_PATH, DIRECTOR_NATIONALITY_PATH, DIRECTOR_OCCUPATION_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_DATE_DETAILS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { toReadableFormat } from "../utils/date";
import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { CONSENT_TO_ACT_AS_DIRECTOR, STOP_TYPE } from "../utils/constants";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { addCheckYourAnswersParamToLink, getField } from "../utils/web";
import { DirectorField } from "../model/director.model";
import { FormattedValidationErrors } from "../model/validation.model";
import { createValidationErrorBasic, formatValidationErrors } from "../validation/validation";
import { getValidationStatus } from "../services/validation.status.service";
import { closeTransaction } from "../services/transaction.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    // Blank the back link rewrite to avoid it being used if a user clicks the back link from check your answers page
    const checkYourAnswersLinkPatch: OfficerFiling = {
        checkYourAnswersLink: ""
    };
    const officerFiling = await patchOfficerFiling(session, transactionId, submissionId, checkYourAnswersLinkPatch);
  
    renderPage(req, res, companyNumber, officerFiling.data);
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    // Check if consentToAct checkbox has been ticked
    if (getField(req, DirectorField.DIRECTOR_CONSENT) !== DirectorField.DIRECTOR_CONSENT) {
      const consentError = createValidationErrorBasic(CONSENT_TO_ACT_AS_DIRECTOR, DirectorField.DIRECTOR_CONSENT);
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      return renderPage(req, res, companyNumber, officerFiling, formatValidationErrors([consentError]));
    }

    // Check if company has been dissolved
    if (await getCurrentOrFutureDissolved(session, companyNumber)){
      return res.redirect(urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED));
    }

    // Patch consentToAct boolean
    const patchFiling: OfficerFiling = {
      consentToAct: true
    };
    await patchOfficerFiling(session, transactionId, submissionId, patchFiling);

    // Run full api validation
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    if (!validationStatus.isValid) {
      return res.redirect(urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.SOMETHING_WENT_WRONG));
    }

    // Close transaction and go to submitted page
    await closeTransaction(session, companyNumber, submissionId, transactionId);
    return res.redirect(urlUtils.getUrlToPath(APPOINT_DIRECTOR_SUBMITTED_PATH, req));

  } catch (e) {
    return next(e);
  }
};

const renderPage = async (req: Request, res: Response, companyNumber: string, officerFiling: OfficerFiling, errors?: FormattedValidationErrors) => {
  const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
  
  return res.render(Templates.APPOINT_DIRECTOR_CHECK_ANSWERS, {
    templateName: Templates.APPOINT_DIRECTOR_CHECK_ANSWERS,
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req),
    cancelLink:  urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
    company: companyProfile,
    officerFiling: officerFiling,
    directorTitle: formatTitleCase(officerFiling.title),
    name: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    formerNames:  formatTitleCase(officerFiling.formerNames),
    occupation:  formatTitleCase(officerFiling.occupation),
    dateOfBirth: toReadableFormat(officerFiling.dateOfBirth),
    appointedOn: toReadableFormat(officerFiling.appointedOn),
    protectedDetails: createDirectorAppliedToProtectDetailsString(officerFiling.directorAppliedToProtectDetails),
    nameLink: addCheckYourAnswersParamToLink(urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req)),
    dateOfBirthLink: addCheckYourAnswersParamToLink(urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req)),
    dateAppointedLink: addCheckYourAnswersParamToLink(urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req)),
    nationalityLink: addCheckYourAnswersParamToLink(urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req)),
    occupationLink: addCheckYourAnswersParamToLink(urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req)),
    protectedDetailsLink: addCheckYourAnswersParamToLink(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req)),
    correspondenceAddressChangeLink: addCheckYourAnswersParamToLink(urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req)), 
    errors: errors
  });
}

const createDirectorAppliedToProtectDetailsString = (directorAppliedToProtectDetails: boolean | undefined) : string => {
  if(directorAppliedToProtectDetails === undefined){
    return ""
  }
  if(directorAppliedToProtectDetails === true){
    return "Yes"
  }
  else{
    return "No"
  }
}