import { postTransaction } from "../services/transaction.service";
import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../utils/url";
import { CURRENT_DIRECTORS_PATH, urlParams } from "../types/page.urls";
import { DESCRIPTION, REFERENCE } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { selectLang } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const session = req.session as Session;
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const lang = req.query.lang;
   
    const transaction: Transaction = await postTransaction(session, companyNumber, DESCRIPTION, REFERENCE);
    const transactionId = transaction.id as string;
    req.params[urlParams.PARAM_TRANSACTION_ID] = transactionId;
    req.params[urlParams.PARAM_SUBMISSION_ID] = "645d1188c794645afe15f5cc";
    var nextPageUrl = urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req);
    if (lang != undefined && lang != "") {
      nextPageUrl = nextPageUrl + "?lang=" + selectLang(lang);
    }
    return res.redirect(nextPageUrl);

  } catch (e) {
    return next(e);
  }
};
