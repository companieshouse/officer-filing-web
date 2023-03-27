import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    return res.render(Templates.REMOVE_DIRECTOR, {
      templateName: Templates.REMOVE_DIRECTOR,
      backLinkUrl: urlUtils.getUrlToPath("/officer-filing-web/company/00006400/transaction/020002-120116-793219/submission/1/active-officers", req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    
  } catch (e) {
    return next(e);
  }
};
