import { NextFunction, Request, Response } from "express";
import {
  CURRENT_DIRECTORS_PATH,
  UPDATE_DIRECTOR_NAME_PATH,
  DIRECTOR_DATE_OF_CHANGE_PATH,
  UPDATE_DIRECTOR_SUBMITTED_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { urlUtils } from "../../utils/url";
import { getCompanyProfile } from "../../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";
import { toReadableFormat } from "../../utils/date";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { closeTransaction } from "../../services/transaction.service";
import { getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
  
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

    // Close transaction and go to submitted page
    // await closeTransaction(session, companyNumber, submissionId, transactionId);
    return res.redirect(urlUtils.getUrlToPath(UPDATE_DIRECTOR_SUBMITTED_PATH, req));

  } catch (e) {
    return next(e);
  } 
};

const renderPage = async (req: Request, res: Response, companyNumber: string, officerFiling: OfficerFiling) => {
  const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();
  
  return res.render(Templates.UPDATE_DIRECTOR_CHECK_ANSWERS, {
    templateName: Templates.UPDATE_DIRECTOR_CHECK_ANSWERS,
    ...getLocaleInfo(locales, lang),
    backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_DATE_OF_CHANGE_PATH, req),
    cancelLink:  urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
    company: companyProfile,
    officerFiling: officerFiling,
    name: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)), 
    occupation:  formatTitleCase(officerFiling.occupation),
    dateUpdated: toReadableFormat("2023-12-22"),             // Temporarily hard-coded until changedDate is available
    nameLink: urlUtils.getUrlToPath(UPDATE_DIRECTOR_NAME_PATH, req),
    nationalityLink: urlUtils.getUrlToPath("", req),
    occupationLink: urlUtils.getUrlToPath("", req),
    dateUpdatedLink: urlUtils.getUrlToPath("", req),
    correspondenceAddressChangeLink: urlUtils.getUrlToPath("", req),
    currentUrl: req.originalUrl,
  });
}