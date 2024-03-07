import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getOfficerFiling } from "../services/officer.filing.service";
import { formatTitleCase } from "../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../utils/format";
import { toReadableFormat } from "../utils/date";
import { CREATE_TRANSACTION_PATH } from "../types/page.urls";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    return res.render(Templates.APPOINT_DIRECTOR_SUBMITTED, {
      referenceNumber: transactionId,
      companyNumber: companyNumber,
      companyName: companyProfile.companyName,
      directorTitle: formatTitleCase(officerFiling.title),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      appointedOn: toReadableFormat(officerFiling.appointedOn),
      templateName: Templates.APPOINT_DIRECTOR_SUBMITTED,
      updateDirectorSameCompany: addLangToUrl(urlUtils.getUrlToPath(CREATE_TRANSACTION_PATH, req), lang),
      ...getLocaleInfo(locales, lang),
      currentUrl : req.originalUrl,
    });
  } catch (e) {
    return next(e);
  }
};
