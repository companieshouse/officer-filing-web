import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { ACTIVE_DIRECTORS_PATH, REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { postOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const appointmentId = urlUtils.getAppointmentIdFromRequestParams(req);
    const session: Session = req.session as Session;
    
    const filingResponse = await postOfficerFiling(session, transactionId, appointmentId);

    return res.render(Templates.REMOVE_DIRECTOR, {
      directorName: filingResponse.name,
      templateName: Templates.REMOVE_DIRECTOR,
      backLinkUrl: urlUtils.getUrlToPath(ACTIVE_DIRECTORS_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //Hardcoded for now
    req.params[urlParams.PARAM_SUBMISSION_ID] = "645d1188c794645afe15f5cc";
    const nextPageUrl = urlUtils.getUrlToPath(REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};
