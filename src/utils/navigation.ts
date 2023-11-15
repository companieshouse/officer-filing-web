import { getOfficerFiling } from "../services/officer.filing.service";
import { Navigation } from "../model/navigation.model";
import * as urls from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { urlUtils } from "./url";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";

export const getNationalityBackLink = async (req: Request) => {
  const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
  const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
  const session: Session = req.session as Session;
  const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

  return officerFiling?.checkYourAnswersLink !== undefined
    ? urls.APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
    : urls.DIRECTOR_DATE_DETAILS_PATH;
};

export const NAVIGATION: Navigation =  {
  [urls.DIRECTOR_NATIONALITY]: {
    currentPage: Templates.DIRECTOR_NATIONALITY,
    previousPage: (officerFiling: OfficerFiling, req: Request) => getNationalityBackLink(req),
    nextPage: [urls.DIRECTOR_OCCUPATION]
  }
}