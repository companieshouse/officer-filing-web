import { NextFunction, Request, Response } from "express";
import { REMOVE_DIRECTOR_PATH, REMOVE_DIRECTOR_SUBMITTED_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);

    return res.render(Templates.REMOVE_DIRECTOR_CHECK_ANSWERS, {
      templateName: Templates.REMOVE_DIRECTOR_CHECK_ANSWERS,
      backLinkUrl: REMOVE_DIRECTOR_PATH,
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
