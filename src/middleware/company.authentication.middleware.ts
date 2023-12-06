import { NextFunction, Request, Response } from "express";
import { authMiddleware, AuthOptions } from "@companieshouse/web-security-node";
import { CHS_URL } from "../utils/properties";
import { urlParams } from "../types/page.urls";

export const companyAuthenticationMiddleware = async (req: Request, res: Response, next: NextFunction) => {

  console.log("####### in companyAuthenticationMiddleware €€€€€")

  console.log(`Request path ${req.path}`);
  console.log(`Request originalUrl ${req.originalUrl}`);
  console.log(`Request baseUrl ${req.baseUrl}`);

  /**
   * checking path instead of original Url.
   */
  if (req.path.match("/cannot-use")) {
    console.log("####### in companyAuthenticationMiddleware. if block €€€€€")
    return next();
  }

  const companyNumber: string = req.params[urlParams.PARAM_COMPANY_NUMBER];

  const authMiddlewareConfig: AuthOptions = {
    chsWebUrl: CHS_URL,
    returnUrl: req.originalUrl,
    companyNumber: companyNumber
  };

  return authMiddleware(authMiddlewareConfig)(req, res, next);
};
