import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { logger } from "../utils/logger";
// import { isCompanyNumberValid } from "../validators/company.number.validator";
import { urlParams } from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { Templates } from "../types/template.paths";

export const companyAuthenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {

  const companyNumber: string = req.params[urlParams.PARAM_COMPANY_NUMBER];

  // if (!isCompanyNumberValid(companyNumber)) {
  //   urlUtils.sanitiseReqUrls(req);
  //   logger.errorRequest(req, "No Valid Company Number in URL: " + req.originalUrl);
  //   return res.status(400).render(Templates.SERVICE_OFFLINE_MID_JOURNEY, { templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY });
  // }

  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: req.originalUrl,
    companyNumber: companyNumber
  };

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};
