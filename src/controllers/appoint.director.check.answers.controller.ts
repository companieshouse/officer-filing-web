import { NextFunction, Request, Response } from "express";
import { DIRECTOR_PROTECTED_DETAILS_PATH, APPOINT_DIRECTOR_SUBMITTED_PATH, CURRENT_DIRECTORS_PATH, URL_QUERY_PARAM, BASIC_STOP_PAGE_PATH, DIRECTOR_NAME_PATH, DIRECTOR_NATIONALITY_PATH, DIRECTOR_OCCUPATION_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_DATE_DETAILS_PATH, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { toReadableFormat } from "../utils/date";
import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { STOP_TYPE } from "../utils/constants";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getField } from "../utils/web";
import { DirectorField } from "../model/director.model";
import { FormattedValidationErrors } from "../model/validation.model";
import { createValidationErrorBasic, formatValidationErrors } from "../validation/validation";
import { getValidationStatus } from "../services/validation.status.service";
import { closeTransaction } from "../services/transaction.service";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

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
    const lang = selectLang(req.query.lang);

    // Check if consentToAct checkbox has been ticked
    if (getField(req, DirectorField.DIRECTOR_CONSENT) !== DirectorField.DIRECTOR_CONSENT) {
      const localeInfo = getLocaleInfo(getLocalesService(), selectLang(req.query.lang));
      const consentError = createValidationErrorBasic(localeInfo.i18n["error-consent-to-act-as-director"], DirectorField.DIRECTOR_CONSENT);
      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      return renderPage(req, res, companyNumber, officerFiling, formatValidationErrors([consentError], ));
    }

    // Check if company has been dissolved
    if (await getCurrentOrFutureDissolved(session, companyNumber)){
      return res.redirect(addLangToUrl(urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED), lang));
    }

    // Patch consentToAct boolean
    const patchFiling: OfficerFiling = {
      consentToAct: true
    };
    await patchOfficerFiling(session, transactionId, submissionId, patchFiling);

    // Run full api validation
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    if (!validationStatus.isValid) {
      return res.redirect(addLangToUrl(urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.SOMETHING_WENT_WRONG), lang));
    }

    // Close transaction and go to submitted page
    await closeTransaction(session, companyNumber, submissionId, transactionId);
    return res.redirect(addLangToUrl(urlUtils.getUrlToPath(APPOINT_DIRECTOR_SUBMITTED_PATH, req), lang));

  } catch (e) {
    return next(e);
  }
};

const renderPage = async (req: Request, res: Response, companyNumber: string, officerFiling: OfficerFiling, errors?: FormattedValidationErrors) => {
  const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  
  return res.render(Templates.APPOINT_DIRECTOR_CHECK_ANSWERS, {
    templateName: Templates.APPOINT_DIRECTOR_CHECK_ANSWERS,
    ...getLocaleInfo(locales, lang),
    currentUrl: urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req),
    backLinkUrl:  addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req), lang),
    cancelLink:  addLangToUrl(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req), lang),
    company: companyProfile,
    officerFiling: officerFiling,
    directorTitle: formatTitleCase(officerFiling.title),
    name: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    formerNames:  formatTitleCase(officerFiling.formerNames),
    occupation:  formatTitleCase(officerFiling.occupation),
    dateOfBirth: toReadableFormat(officerFiling.dateOfBirth, lang),
    appointedOn: toReadableFormat(officerFiling.appointedOn, lang),
    protectedDetails: createDirectorAppliedToProtectDetailsString(officerFiling.directorAppliedToProtectDetails, req),
    nameLink: addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req), lang),
    dateOfBirthLink: addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req), lang),
    dateAppointedLink: addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req), lang),
    nationalityLink: addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req), lang),
    occupationLink: addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req), lang),
    protectedDetailsLink: addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req), lang),
    correspondenceAddressChangeLink: addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req), lang),
    errors: errors
  });
}

const createDirectorAppliedToProtectDetailsString = (directorAppliedToProtectDetails: boolean | undefined, req: Request) : string => {
  const localeInfo = getLocaleInfo(getLocalesService(), selectLang(req.query.lang));
  if(directorAppliedToProtectDetails === undefined){
    return ""
  }
  if(directorAppliedToProtectDetails === true){
    return localeInfo.i18n.yes
  }
  else{
    return localeInfo.i18n.no
  }
}