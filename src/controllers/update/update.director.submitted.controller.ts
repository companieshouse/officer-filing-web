import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { Templates } from "../../types/template.paths";
import { formatTitleCase } from "../../services/confirm.company.service";
import { retrieveDirectorNameFromFiling } from "../../utils/format";
import { getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { CREATE_TRANSACTION_PATH } from "../../types/page.urls";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);

    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    return resp.render(Templates.UPDATE_DIRECTOR_SUBMITTED, {
      templateName: Templates.UPDATE_DIRECTOR_SUBMITTED,
      referenceNumber: transactionId,
      companyNumber: companyNumber,
      companyName: companyProfile.companyName,
      directorTitle: officerFiling.title,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      updateDirectorSameCompany: urlUtils.getUrlToPath(CREATE_TRANSACTION_PATH, req),
      nameHasBeenUpdated: officerFiling.nameHasBeenUpdated,
      nationalityHasBeenUpdated: officerFiling.nationalityHasBeenUpdated,
      occupationHasBeenUpdated: officerFiling.occupationHasBeenUpdated,
      residentialAddressHasBeenUpdated: officerFiling.residentialAddressHasBeenUpdated,
      correspondenceAddressHasBeenUpdated: officerFiling.correspondenceAddressHasBeenUpdated,
      ...getLocaleInfo(locales, lang),
      currentUrl : req.originalUrl,
    });
  } catch (e) {
    return next(e);
  }
}
