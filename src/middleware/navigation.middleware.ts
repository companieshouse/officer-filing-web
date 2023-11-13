import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import { FormattedValidationErrors } from "../model/validation.model";
import { getOfficerFiling } from "../services/officer.filing.service";
import { NAVIGATION } from "../utils/navigation";
import { urlUtils } from "../utils/url";
import { getPageUrls } from "../model/navigation.model";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { NATIONALITY_LIST } from "../utils/properties";

export const checkValidations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("======== Calling check validation ")
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      console.log(`======== Calling ERROR LIST ${JSON.stringify(errorList)} `)

      const errors = formatValidationError(errorList.array());

      const routePath = req.route.path;
      console.log(`======== ROUTE ERROR LIST ${routePath} `)

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

function formatValidationError(errorList: ValidationError[]): FormattedValidationErrors {
  const errors = { errorList: [] } as any;
  errorList.forEach( e => {
    errors.errorList.push({ href: `#${e.param}`, text: e.msg });
    errors[e.param] = { text: e.msg };
  });
  return errors;
}
