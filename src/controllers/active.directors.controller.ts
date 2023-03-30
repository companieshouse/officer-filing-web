import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CONFIRM_COMPANY_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import {
  DIRECTOR_DETAILS_ERROR,
  OFFICER_ROLE } from "../utils/constants";
  import {
    equalsIgnoreCase
  } from "../utils/format";
import { ActiveOfficerDetails } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { Session } from "@companieshouse/node-session-handler";
import { getListActiveDirectorDetails } from "../services/active.directors.details.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const directors: ActiveOfficerDetails[] = await getListActiveDirectorDetails(session, transactionId);
    const officerLists = buildOfficerLists(directors);

    return res.render(Templates.ACTIVE_DIRECTORS, {
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: urlUtils.getUrlToPath(CONFIRM_COMPANY_PATH, req),
      directorsList: officerLists.directorList,
      corporateDirectorList: officerLists.corporateDirectorList
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const activeOfficerDetailsBtnValue = req.body.activeOfficers;

      return res.render(Templates.ACTIVE_DIRECTORS, {
        backLinkUrl: urlUtils.getUrlToPath(CONFIRM_COMPANY_PATH, req),
        officerErrorMsg: DIRECTOR_DETAILS_ERROR,
        templateName: Templates.ACTIVE_DIRECTORS,
      });
  } catch (e) {
    return next(e);
  }
};

const buildDirectorList = (officers: ActiveOfficerDetails[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.role, OFFICER_ROLE.DIRECTOR) && !officer.isCorporate)
    .map(officer => {
      return {
        officer
      };
    });
};

const buildCorporateOfficerList = (officers: ActiveOfficerDetails[], wantedOfficerRole: OFFICER_ROLE): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.role, wantedOfficerRole) && officer.isCorporate)
    .map(officer => {
      return {
        officer
      };
    });
};

const buildOfficerLists = (officers: ActiveOfficerDetails[]): any => {
  return {
    directorList: buildDirectorList(officers),
    corporateDirectorList: buildCorporateOfficerList(officers, OFFICER_ROLE.DIRECTOR),
  };
};
