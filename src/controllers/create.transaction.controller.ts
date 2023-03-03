import { postTransaction } from "../services/transaction.service";
import { NextFunction, Request, Response } from "express";
import { urlUtils } from "../utils/url";
import { ACTIVE_OFFICERS_PATH, TRADING_STATUS_PATH, urlParams, URL_QUERY_PARAM } from "../types/page.urls";
import { DESCRIPTION, REFERENCE } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
//import { createConfirmationStatement } from "../services/confirmation.statement.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
//import { ConfirmationStatementCreated } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const session = req.session as Session;
    const companyNumber = req.params[urlParams.PARAM_COMPANY_NUMBER];
    const transaction: Transaction = await postTransaction(session, companyNumber, DESCRIPTION, REFERENCE);
    const transactionId = transaction.id as string;
    //const submissionResponse = await createConfirmationStatement(session, transactionId);
    //if (submissionResponse.httpStatusCode === 201) {
    //  const castedResponseResource: ConfirmationStatementCreated =
    //    submissionResponse.resource as ConfirmationStatementCreated;
      //const nextPageUrl = urlUtils
        //.getUrlWithCompanyNumberTransactionIdAndSubmissionId(TRADING_STATUS_PATH, companyNumber,
          //                                                   transactionId, "castedResponseResource.id");
      console.log(transactionId);
      var nextPageUrl = urlUtils.getUrlToPath(ACTIVE_OFFICERS_PATH, req)
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_TRANSACTION_ID, transactionId);
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_SUBMISSION_ID, "1");
      return res.redirect(nextPageUrl);
    //}
    //next(new Error(`Unable to create Confirmation Statement, httpStatusCode = ${submissionResponse.httpStatusCode}, resource = ${JSON.stringify(submissionResponse.resource)}`));
  } catch (e) {
    return next(e);
  }
};
