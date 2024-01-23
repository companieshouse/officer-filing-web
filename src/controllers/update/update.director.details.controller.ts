import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import {
  CURRENT_DIRECTORS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, UPDATE_DIRECTOR_NAME_PATH,
  DIRECTOR_DATE_OF_CHANGE_PATH, UPDATE_DIRECTOR_OCCUPATION_PATH, UPDATE_DIRECTOR_DETAILS_PATH,
  UPDATE_DIRECTOR_NATIONALITY_PATH
} from "../../types/page.urls";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { selectLang, addLangToUrl, getLocalesService, getLocaleInfo } from "../../utils/localise";
import { formatTitleCase } from "../../utils/format";

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
      officerFiling.correspondenceAddressHasBeenUpdated || officerFiling.residentialAddressHasBeenUpdated) {
      updatedData = true;
    }

    return resp.render(Templates.UPDATE_DIRECTOR_DETAILS, {
      templateName: Templates.UPDATE_DIRECTOR_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
      cancelLink:  urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
      officerFiling: officerFiling,
      directorTitle: formatTitleCase(officerFiling.title),
      ...officerFiling,
      ...companyProfile,
      ...getLocaleInfo(locales, lang),
      currentUrl: urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req),
      nameLink: urlUtils.getUrlToPath(UPDATE_DIRECTOR_NAME_PATH, req),
      nationalityLink: addLangToUrl(urlUtils.getUrlToPath(UPDATE_DIRECTOR_NATIONALITY_PATH, req), lang),
      occupationLink: urlUtils.getUrlToPath(UPDATE_DIRECTOR_OCCUPATION_PATH, req),
      correspondenceAddressChangeLink: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
      isUpdate: true,
      updatedData: updatedData,
    })
  } catch(e) {
    return next(e);
  }
};

export const post = (req: Request, resp: Response, next: NextFunction) => {
  if (req.body.back_to_active_directors) {
    return resp.redirect(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req));
  }
  return resp.redirect(urlUtils.getUrlToPath(DIRECTOR_DATE_OF_CHANGE_PATH, req));
};
