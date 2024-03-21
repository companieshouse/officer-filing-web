import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import {
  CURRENT_DIRECTORS_PATH, UPDATE_DIRECTOR_NAME_PATH,
  DIRECTOR_DATE_OF_CHANGE_PATH, UPDATE_DIRECTOR_OCCUPATION_PATH, UPDATE_DIRECTOR_DETAILS_PATH,
  UPDATE_DIRECTOR_NATIONALITY_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
} from "../../types/page.urls";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const lang = selectLang(req.query.lang);
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    const locales = getLocalesService();
    let updatedData = false;

    if (officerFiling.nameHasBeenUpdated || officerFiling.occupationHasBeenUpdated || officerFiling.nationalityHasBeenUpdated ||
      officerFiling.serviceAddressHasBeenUpdated || officerFiling.residentialAddressHasBeenUpdated) {
      updatedData = true;
    }

    return resp.render(Templates.UPDATE_DIRECTOR_DETAILS, {
      templateName: Templates.UPDATE_DIRECTOR_DETAILS,
      backLinkUrl: addLangToUrl(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req), lang),
      cancelLink:  addLangToUrl(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req), lang),
      officerFiling: officerFiling,
      directorTitle: formatTitleCase(officerFiling.title),
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      ...officerFiling,
      ...companyProfile,
      ...getLocaleInfo(locales, lang),
      currentUrl: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req), lang),
      nameLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_NAME_PATH, req), lang),
      nationalityLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_NATIONALITY_PATH, req), lang),
      occupationLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_OCCUPATION_PATH, req), lang),
      correspondenceAddressChangeLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req), lang),
      isUpdate: true,
      updatedData: updatedData,
    })
  } catch(e) {
    return next(e);
  }
};

export const post = (req: Request, resp: Response, next: NextFunction) => {
    const lang = selectLang(req.query.lang);
  if (req.body.back_to_active_directors) {
    return resp.redirect(addLangToUrl(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req), lang));
  }
  return resp.redirect(addLangToUrl(urlUtils.getUrlToPath(DIRECTOR_DATE_OF_CHANGE_PATH, req), lang));
};
