import { OfficerFilingService } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import { FormattedValidationErrors } from "model/validation.model";
import { getOfficerFiling } from "services/officer.filing.service";
import { urlUtils } from "utils/url";

export const checkValidations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      const errors = formatValidationError(errorList.array());

      const routePath = req.route.path;

      const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
      const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
      const session: Session = req.session as Session;

      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      //see if you can get the controller or url called
      // extract the template name from it, 
      // extract backlink from it
      // extract currentpage from it
      // const getCallingController = 
      return res.render('', {
        backLinkUrl: '',
        templateName: '',
        ...req.body,
        ...officerFiling,
        errors
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
