import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { ValidationError, validationResult } from "express-validator";
import { FormattedValidationErrors } from "../model/validation.model";
import { getOfficerFiling } from "../services/officer.filing.service";
import { NAVIGATION } from "../utils/navigation";
import { urlUtils } from "../utils/url";

export const checkValidations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("======== Calling check validation ")
    const errorList = validationResult(req);

    if (!errorList.isEmpty()) {
      console.log(`======== Calling ERROR LIST ${errorList} `)

      const errors = formatValidationError(errorList.array());

      const routePath = req.route.path;
      console.log(`======== ROUTE ERROR LIST ${routePath} `)

      const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
      const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
      const session: Session = req.session as Session;

      const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
      //see if you can get the controller or url called
      // extract the template name from it, 
      // extract backlink from it
      // extract currentpage from it
      // const getCallingController = 
      console.log(`======== NAVIGATION IS LIST ${NAVIGATION[routePath].currentPage} `)
      console.log(`======== NAVIGATION BACK LINK ${NAVIGATION[routePath].previousPage} `)

      
      return res.render(NAVIGATION[routePath].currentPage, {
        backLinkUrl: NAVIGATION[routePath].previousPage(officerFiling, req),
        templateName: NAVIGATION[routePath].currentPage,
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
