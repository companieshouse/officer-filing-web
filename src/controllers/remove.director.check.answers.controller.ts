import { NextFunction, Request, Response } from "express";
import { REMOVE_DIRECTOR_PATH, REMOVE_DIRECTOR_SUBMITTED_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/officer-filing/types";
import { getDirector } from "../services/company.profile.service";
import { logger } from "../utils/logger";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumberTodoChangeMe = urlUtils.getCompanyNumberFromRequestParams(req);
    const companyNumber = "00006400"
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const companyOfficer: CompanyOfficer = await getDirectorAndTerminationDate(submissionId);

    return res.render(Templates.REMOVE_DIRECTOR_CHECK_ANSWERS, {
      templateName: Templates.REMOVE_DIRECTOR_CHECK_ANSWERS,
      backLinkUrl: REMOVE_DIRECTOR_PATH,
      company: companyProfile,
      director: companyOfficer
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.redirect(REMOVE_DIRECTOR_SUBMITTED_PATH);
  } catch (e) {
    return next(e);
  }
};
