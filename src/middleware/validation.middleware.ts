import { NextFunction, Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";
import {
  RemovalDateKey,
  RemovalDateKeys
} from "../model/date.model";

import { logger } from '../utils/logger';
import { Templates } from "../types/template.paths";
import { ACTIVE_OFFICERS_PATH_END, OFFICER_FILING, DATE_DIRECTOR_REMOVED_PATH_END } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { getCompanyAppointmentFullRecord } from "../services/company.appointments.service";

export async function checkValidations(req: Request, res: Response, next: NextFunction) {
  try {
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const appointmentId = urlUtils.getAppointmentIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());

      // Bypass the direct use of variables with dashes that
      // govukDateInput adds for day, month and year field
      const dates = {
        [RemovalDateKey]: RemovalDateKeys.reduce((o, key) => Object.assign(o, { [key]: req.body[key] }), {})
      };

      const backLink = OFFICER_FILING + req.route.path.replace(DATE_DIRECTOR_REMOVED_PATH_END, ACTIVE_OFFICERS_PATH_END);
      const appointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, companyNumber, appointmentId);

      return res.render(Templates.REMOVE_DIRECTOR, {
        directorName: appointment.name,
        backLinkUrl: backLink,
        templateName: Templates.REMOVE_DIRECTOR,
        ...req.body,
        ...dates,
        errors
      });
    }

    return next();
  } catch (err) {
    logger.errorRequest(req, err);
    next(err);
  }
}

export type FormattedValidationErrors = {
  [key: string]: {
    text: string;
  },
} & {
  errorList: {
    href: string,
    text: string,
  }[],
};

export function formatValidationError(errorList: ValidationError[]): FormattedValidationErrors {
  const errors = { errorList: [] } as any;
  errorList.forEach( e => {
    errors.errorList.push({ href: `#${e.param}`, text: e.msg });
    errors[e.param] = { text: e.msg };
  });
  return errors;
}
