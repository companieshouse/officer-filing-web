import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { REMOVE_DIRECTOR_CHECK_ANSWERS_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);

    return res.render(Templates.REMOVE_DIRECTOR, {
      templateName: Templates.REMOVE_DIRECTOR,
      backLinkUrl: urlUtils.getUrlToPath("/officer-filing-web/company/00006400/transaction/020002-120116-793219/active-directors", req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //Hardcoded for now
    const nextPageUrl = urlUtils.getUrlToPath(REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};
