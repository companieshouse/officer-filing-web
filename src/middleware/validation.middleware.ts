import { NextFunction, Request, Response } from "express";
import { validationResult, ValidationError } from "express-validator";

import { getApplicationData, prepareData } from "../utils/application.data";
import {
  RemovalDateKey,
  RemovalDateKeys
} from "../model/date.model";

import { logger } from '../utils/logger';
import { EntityNameKey, ID } from "../model/data.types.model";
import { ApplicationData } from "../model/application.model";
import { Templates } from "../types/template.paths";

export function checkValidations(req: Request, res: Response, next: NextFunction) {
  try {
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());

      // Bypass the direct use of variables with dashes that
      // govukDateInput adds for day, month and year field
      const dates = {
        [RemovalDateKey]: prepareData(req.body, RemovalDateKeys)
      };

      // need to pass the id req param back into the page if present in the url in order to show the remove button again
      // when changing BO or MO data after failing validation. If not present, undefined will be passed in, which is fine as those pages
      // that don't use id will just ignore it.
      const id = req.params[ID];
      const appData: ApplicationData = getApplicationData(req.session);
      const entityName = appData?.[EntityNameKey];

      return res.render(Templates.REMOVE_DIRECTOR, {
        backLinkUrl: "/officer-filing-web/company/00006400/transaction/020002-120116-793219/submission/1/active-officers",
        templateName: Templates.REMOVE_DIRECTOR,
        id,
        entityName,
        ...appData,
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
