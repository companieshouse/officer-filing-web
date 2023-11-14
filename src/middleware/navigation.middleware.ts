import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { FormattedValidationErrors, ValidationError } from '../model/validation.model';
import { getOfficerFiling } from "../services/officer.filing.service";
import { NAVIGATION } from "../utils/navigation";
import { urlUtils } from "../utils/url";
import { getPageUrls } from "../model/navigation.model";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { NATIONALITY_LIST } from "../utils/properties";
import { validationResult } from 'express-validator';
import { createValidationErrorBasic } from "../validation/validation";

export const checkValidations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errorList = validationResult(req);
    if (!errorList.isEmpty()) {
      const errorArray = validationResult(req).array().map(i => i);
      console.log(`===ARRAY IS ${errorArray}`)

      const errorMapResult = errorMap(errorArray);

      const errors = formatValidationError(buildValidationErrors(errorMapResult));

      const routePath = req.route.path;
      const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
      const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
      const session: Session = req.session as Session;

      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

      const templateName = getPageUrls(NAVIGATION[routePath].currentPage, req);
      return res.render(templateName, {
        backLinkUrl: getPageUrls(NAVIGATION[routePath].previousPage(officerFiling, req), req),
        templateName: templateName,
        errors,
        ...req.body,
        ...officerFiling,
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        typeahead_array: NATIONALITY_LIST + "|" + NATIONALITY_LIST + "|" + NATIONALITY_LIST,
      });
    } 
    return next();
  } catch (err) {
    next(err);
  }
}

function formatValidationError(validationErrors: ValidationError[]): FormattedValidationErrors {
  const errors = { errorList: [] } as any;
  validationErrors.forEach( e => {
    errors.errorList.push({ href: `#${e.link}`, text: e.messageKey});
    errors[e.link] = { text: e.messageKey };

    e.source.forEach(field => {
      errors[field] = {text: e.messageKey}
    });    
  });
  return errors;
}

const buildValidationErrors = (errorList: ValidationError): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  validationErrors.push(createValidationErrorBasic(errorList.messageKey, errorList.link))
  return validationErrors;
}

const errorMap = (errorList): ValidationError => {
  return {
    messageKey: errorList.msg,
    link: errorList.param,
    source: errorList.link
  }
}
