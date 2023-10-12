import { NextFunction, Request, Response } from "express";
import { DIRECTOR_PROTECTED_DETAILS_PATH, APPOINT_DIRECTOR_SUBMITTED_PATH, CURRENT_DIRECTORS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
  const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
  try {
    return res.render(Templates.APPOINT_DIRECTOR_CHECK_ANSWERS, {
      templateName: Templates.APPOINT_DIRECTOR_CHECK_ANSWERS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req),
      cancelLink:  urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
      company: companyProfile,
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(APPOINT_DIRECTOR_SUBMITTED_PATH, req);
  return res.redirect(nextPageUrl);
};
