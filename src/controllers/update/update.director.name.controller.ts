import { getDirectorName, postDirectorName } from "../../controllers/shared.controllers/director.name.controller"
import { NextFunction, Request, Response } from "express"
import { UPDATE_DIRECTOR_NAME_PATH, UPDATE_DIRECTOR_DETAILS_PATH, BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM } from "../../types/page.urls"
import { Templates } from "../../types/template.paths"
import { urlUtils } from "../../utils/url"
import { Session } from "@companieshouse/node-session-handler"
import { getOfficerFiling } from "../../services/officer.filing.service"
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types"
import { getCompanyAppointmentFullRecord } from "../../services/company.appointments.service"
import { STOP_TYPE } from "../../utils/constants"

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorName(req, resp, next, Templates.UPDATE_DIRECTOR_NAME, UPDATE_DIRECTOR_DETAILS_PATH, true);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  // Validate etag before post
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const companyNumber= urlUtils.getCompanyNumberFromRequestParams(req);
    const currentOfficer = await getOfficerFiling(session, transactionId, submissionId);
    const appointmentId = currentOfficer.referenceAppointmentId as string;
    const companyAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

    if (currentOfficer.referenceEtag !== companyAppointment.etag) {
      return resp.redirect(
        urlUtils.setQueryParam(urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req), 
        URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.ETAG));
    };
  } catch(e) {
    return next(e);
  };

  postDirectorName(req, resp, next, UPDATE_DIRECTOR_DETAILS_PATH, true);
};
