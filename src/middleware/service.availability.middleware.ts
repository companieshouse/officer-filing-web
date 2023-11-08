import { NextFunction, Request, Response } from "express";
import { OFFICER_FILING_WEB_ACTIVE, EWF_URL } from "../utils/properties";
import { Templates } from "../types/template.paths";
import { isActiveFeature } from "../utils/feature.flag";

/**
 * Shows 500 page if config flag OFFICER_FILING_WEB_ACTIVE=false
 */
export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {

  if (!isActiveFeature(OFFICER_FILING_WEB_ACTIVE)) {
    return res.render(Templates.SERVICE_OFFLINE_MID_JOURNEY, {EWF_URL});
  }

  return next();
};
