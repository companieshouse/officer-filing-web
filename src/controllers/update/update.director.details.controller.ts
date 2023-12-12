import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { urlUtils } from "../../utils/url";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../services/company.profile.service";
import { ACTIVE_DIRECTORS_DETAILS_PATH, CURRENT_DIRECTORS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_NAME_PATH, 
        DIRECTOR_NATIONALITY_PATH, DIRECTOR_OCCUPATION_PATH } from "../../types/page.urls";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const get = async (req: Request, resp: Response, next: NextFunction) => {
  try {
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const officerFiling: OfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
    let updatedData = false;

    // This will determine the button that appears at the bottom of the page,
    // but needs model changes from 1482
    // if (officerFiling.name_has_been_updated || officerFiling.nationality_has_been_updated || officerFiling.occupation_has_been_updated ||
    //   officerFiling.correspondence_address_has_been_updated || officerFiling.resedential_address_has_been_updated === true) {
    //   updatedData = true;
    // }

    return resp.render(Templates.UPDATE_DIRECTOR_DETAILS, {
      templateName: Templates.UPDATE_DIRECTOR_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(ACTIVE_DIRECTORS_DETAILS_PATH, req),
      cancelLink:  urlUtils.getUrlToPath(ACTIVE_DIRECTORS_DETAILS_PATH, req),
      officerFiling: officerFiling,
      ...officerFiling,
      ...companyProfile,
      nameLink: urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req),
      nationalityLink: urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req),
      occupationLink: urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req),
      correspondenceAddressChangeLink: urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, req),
      updateJourney: true,
      updatedData: updatedData,
    })
  } catch(e) {
    return next(e);
  }
};

export const post = (req: Request, resp: Response, next: NextFunction) => {
  if (req.body.back_to_active_directors) {
    return resp.redirect(urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req));
  }
  return resp.redirect(urlUtils.getUrlToPath("", req));
};
