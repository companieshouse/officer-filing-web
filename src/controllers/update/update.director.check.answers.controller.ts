import { NextFunction, Request, Response } from "express";
import {
  CURRENT_DIRECTORS_PATH,
  UPDATE_DIRECTOR_NAME_PATH,
  DIRECTOR_DATE_OF_CHANGE_PATH,
  UPDATE_DIRECTOR_SUBMITTED_PATH,
  UPDATE_DIRECTOR_NATIONALITY_PATH,
  URL_QUERY_PARAM,
  BASIC_STOP_PAGE_PATH,
  UPDATE_DIRECTOR_DETAILS_PATH,
  UPDATE_DIRECTOR_OCCUPATION_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getCompanyProfile } from "../../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromAppointment, retrieveDirectorNameFromFiling } from "../../utils/format";
import { toReadableFormat } from "../../utils/date";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getValidationStatus } from "../../services/validation.status.service";
import { closeTransaction } from "../../services/transaction.service";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { STOP_TYPE } from "../../utils/constants";
import { getCurrentOrFutureDissolved } from "../../services/stop.page.validation.service";
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service";
import { addCheckYourAnswersParamToLink } from "../../utils/web";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    // redirect to update page if no changes have been made
    if (hasNotBeenUpdated(officerFiling)) {
      return res.redirect(urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req));
    }
  
    renderPage(req, res, companyNumber, officerFiling);
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
    const currentOfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const appointmentId = currentOfficerFiling.referenceAppointmentId as string;
    const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    // Check if company has been dissolved
    if (await getCurrentOrFutureDissolved(companyNumber)){
      return res.redirect(addLangToUrl(urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED), lang));
    }

    // Check if ETAG matches
    if (currentOfficerFiling.referenceEtag !== companyAppointment.etag) {
      return res.redirect(
        addLangToUrl(urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.ETAG),lang));
    }

    // Run full api validation
    const validationStatus = await getValidationStatus(session, transactionId, submissionId);
    if (!validationStatus.isValid) {
      return res.redirect(addLangToUrl(urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.SOMETHING_WENT_WRONG), lang));
    }

    // Close transaction and go to submitted page
    await closeTransaction(session, companyNumber, submissionId, transactionId);
    return res.redirect(addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_SUBMITTED_PATH, req), lang));

  } catch (e) {
    return next(e);
  } 
};

const renderPage = async (req: Request, res: Response, companyNumber: string, officerFiling: OfficerFiling) => {
  const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  const companyAppointment = await getCompanyAppointmentFullRecord(req.session as Session, companyNumber, officerFiling.referenceAppointmentId as string);

  let backLinkUrlWithCya = addCheckYourAnswersParamToLink(urlUtils.getUrlToPath(DIRECTOR_DATE_OF_CHANGE_PATH, req))
  return res.render(Templates.UPDATE_DIRECTOR_CHECK_ANSWERS, {
    templateName: Templates.UPDATE_DIRECTOR_CHECK_ANSWERS,
    ...getLocaleInfo(locales, lang),

    backLinkUrl: addLangToUrl(backLinkUrlWithCya, lang),
    cancelLink:  addLangToUrl(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req), lang),
    company: companyProfile,
    officerFiling: officerFiling,
    directorTitle: formatTitleCase(officerFiling.title),
    directorNameCompanyAppointment: formatTitleCase(retrieveDirectorNameFromAppointment(companyAppointment)),
    name: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
    occupation:  formatTitleCase(officerFiling.occupation),
    dateUpdated: toReadableFormat(officerFiling.directorsDetailsChangedDate, lang),
    nameLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_NAME_PATH, req) ,lang),
    nationalityLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_NATIONALITY_PATH, req), lang),
    occupationLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_OCCUPATION_PATH, req), lang),
    dateUpdatedLink:  addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_DATE_OF_CHANGE_PATH, req), lang),
    correspondenceAddressChangeLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req), lang),
    currentUrl: req.originalUrl,
  });
}

const hasNotBeenUpdated = (officerFiling: OfficerFiling): boolean => {
  return  !officerFiling.nameHasBeenUpdated && 
          !officerFiling.nationalityHasBeenUpdated && 
          !officerFiling.occupationHasBeenUpdated && 
          !officerFiling.serviceAddressHasBeenUpdated && 
          !officerFiling.residentialAddressHasBeenUpdated;
}