import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { urlParams } from "../types/page.urls";
import { sanitizeCompanyNumber } from "../utils/url";

export const companyAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const companyNumber: string = sanitizeCompanyNumber(req.params[urlParams.PARAM_COMPANY_NUMBER]);
  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: req.originalUrl,
    companyNumber: companyNumber
  };

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};
