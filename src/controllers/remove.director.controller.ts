import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { ACTIVE_DIRECTORS_PATH, REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { validationResult, ValidationError } from "express-validator";
import { FormattedValidationErrors } from "../middleware/validation.middleware"
import { postOfficerFiling } from "../services/officer.filing.service";
import { Session } from "@companieshouse/node-session-handler";
import { getValidationStatus } from "../services/validation.status.service";
import {
  RemovalDateKey,
  RemovalDateKeys
} from "../model/date.model";
import { retrieveErrorMessageToDisplay } from "../services/remove.directors.date.service";
import { ACTIVE_OFFICERS_PATH_END, OFFICER_FILING, REMOVE_DIRECTOR_PATH_END } from "../types/page.urls";

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

    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = "645d1188c794645afe15f5cc";
    const session: Session = req.session as Session;

    const validationStatus: ValidationStatusResponse = await getValidationStatus(session, transactionId, submissionId);
    const errorMessage = retrieveErrorMessageToDisplay(validationStatus);


    if (errorMessage) {
      const error = formatValidationError(errorMessage);

      // Bypass the direct use of variables with dashes that
      // govukDateInput adds for day, month and year field
      
      const dates = {
        [RemovalDateKey]: RemovalDateKeys.reduce((o, key) => Object.assign(o, { [key]: req.body[key] }), {})
      };

      const backLink = OFFICER_FILING + req.route.path.replace(REMOVE_DIRECTOR_PATH_END, ACTIVE_OFFICERS_PATH_END);

      return res.render(Templates.REMOVE_DIRECTOR, {
        backLinkUrl: backLink,
        templateName: Templates.REMOVE_DIRECTOR,
        ...req.body,
        ...dates,
        error
      });

    }

    const nextPageUrl = urlUtils.getUrlToPath(REMOVE_DIRECTOR_CHECK_ANSWERS_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

export function formatValidationError(errorMessage: string): FormattedValidationErrors {
  const errors = { errorMessage: [] } as any;
    errors.errorList.push({ href: `#removal_date["removal_date-day"]`, text: errorMessage });
    errors[RemovalDateKey["removal_date-day"]] = { text: errorMessage };
  return errors;
};
