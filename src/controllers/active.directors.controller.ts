import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CONFIRM_COMPANY_PATH } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { buildPaginationData } from '../utils/pagination';
import { RESULTS_PER_PAGE } from '../config/index';

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

    const { itemsPerPage = 0, startIndex = 0, totalResults = 0 } = officerLists.resource || {};
    let pagination;
    if (totalResults > 0 && itemsPerPage > 0) {
      const numOfPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
      pagination = buildPaginationData(startIndex + 1, numOfPages, "activeDirectors");
    }
    return res.render(Templates.ACTIVE_DIRECTORS, { 
      templateName: Templates.ACTIVE_DIRECTORS,
      backLinkUrl: urlUtils.getUrlToPath(CONFIRM_COMPANY_PATH, req),
      directorsList: officerLists.directorsList,
      corporateDirectorsList: officerLists.corporateDirectorsList, 
      pagination, 
      itemsPerPage, 
      startIndex, 
      totalResults
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

const buildDirectorsList = (officers: ActiveOfficerDetails[]): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.role, OFFICER_ROLE.DIRECTOR) && !officer.isCorporate);
};

const buildCorporateDirectorsList = (officers: ActiveOfficerDetails[], wantedOfficerRole: OFFICER_ROLE): any[] => {
  return officers
    .filter(officer => equalsIgnoreCase(officer.role, wantedOfficerRole) && officer.isCorporate);
};

const buildOfficerLists = (officers: ActiveOfficerDetails[]): any => {
  return {
    directorsList: buildDirectorsList(officers),
    corporateDirectorsList: buildCorporateDirectorsList(officers, OFFICER_ROLE.DIRECTOR),
  };
};
