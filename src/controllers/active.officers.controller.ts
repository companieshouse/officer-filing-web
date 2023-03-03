import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CONFIRM_COMPANY } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import {
  DIRECTOR_DETAILS_ERROR,
  RADIO_BUTTON_VALUE,
  SECTIONS } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
// import {
//   ActiveOfficerDetails,
//   SectionStatus } from "@companieshouse/api-sdk-node/dist/services/confirmation-statement";

//import { formatAddressForDisplay, formatOfficerDetails, formatTitleCase } from "../utils/format";
//import { getActiveOfficerDetailsData } from "../services/active.director.details.service";
//import { sendUpdate } from "../utils/update.confirmation.statement.submission";
//import {
//  getRadioButtonInvalidValueErrorMessage,
//  isRadioButtonValueValid
//} from "../validators/radio.button.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    // const officerDetails: ActiveOfficerDetails = await getActiveOfficerDetailsData(session, transactionId, submissionId);
    // const activeOfficerDetails = formatOfficerDetails(officerDetails);
    // const serviceAddress = formatAddressForDisplay(activeOfficerDetails.serviceAddress);
    // const residentialAddress = formatAddressForDisplay(activeOfficerDetails.residentialAddress);
    // const countryOfResidence = formatTitleCase(activeOfficerDetails.countryOfResidence);

    return res.render(Templates.ACTIVE_OFFICERS, {
      templateName: Templates.ACTIVE_OFFICERS,
      backLinkUrl: urlUtils.getUrlToPath(CONFIRM_COMPANY, req),
      // activeOfficerDetails,
      // serviceAddress,
      // residentialAddress,
      // countryOfResidence
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

    // if (!isRadioButtonValueValid(activeOfficerDetailsBtnValue)) {
    //   return next(new Error(getRadioButtonInvalidValueErrorMessage(activeOfficerDetailsBtnValue)));
    // }
    // if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.YES) {
    //   await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.CONFIRMED);
    //   return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    // } else if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.RECENTLY_FILED) {
    //   await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.RECENT_FILING);
    //   return res.redirect(urlUtils.getUrlToPath(TASK_LIST_PATH, req));
    // } else if (activeOfficerDetailsBtnValue === RADIO_BUTTON_VALUE.NO) {
    //   await sendUpdate(req, SECTIONS.ACTIVE_OFFICER, SectionStatus.NOT_CONFIRMED);
    //   return res.redirect(urlUtils.getUrlToPath(WRONG_OFFICER_DETAILS_PATH, req));
    // } else {
    //   const officerDetails: ActiveOfficerDetails = await getActiveOfficerDetailsData(session, transactionId, submissionId);
    //   const activeOfficerDetails = formatOfficerDetails(officerDetails);
    //   const serviceAddress = formatAddressForDisplay(activeOfficerDetails?.serviceAddress);
    //   const residentialAddress = formatAddressForDisplay(activeOfficerDetails?.residentialAddress);
      return res.render(Templates.ACTIVE_OFFICERS, {
        backLinkUrl: urlUtils.getUrlToPath(CONFIRM_COMPANY, req),
        officerErrorMsg: DIRECTOR_DETAILS_ERROR,
        templateName: Templates.ACTIVE_OFFICERS,
        // activeOfficerDetails,
        // serviceAddress,
        // residentialAddress
      });
    //}
  } catch (e) {
    return next(e);
  }
};
