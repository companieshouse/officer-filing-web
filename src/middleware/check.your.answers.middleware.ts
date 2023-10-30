import { NextFunction, Request, Response } from "express";
import { CHECK_YOUR_ANSWERS_PATH_END } from "../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";
import { urlUtils } from "../utils/url";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { patchOfficerFiling } from "../services/officer.filing.service";

export const checkYourAnswersMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(`********check your answers middleware is ${req.headers.referer}`);
    console.log(`========= check you answer correct is ${req.headers.referer?.endsWith(CHECK_YOUR_ANSWERS_PATH_END)}`);
    if (req.headers.referer?.endsWith(CHECK_YOUR_ANSWERS_PATH_END)) {
      const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
      const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
      const session: Session = req.session as Session;
      const officerFiling: OfficerFiling = {
        checkYourAnswersLink: req.headers.referer
      };
      await patchOfficerFiling(session, transactionId, submissionId, officerFiling);
    }
    return next();
  };
};
