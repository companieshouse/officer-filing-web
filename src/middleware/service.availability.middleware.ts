import { NextFunction, Request, Response } from "express";
import { TM01_ACTIVE, EWF_URL } from "../utils/properties";
import { Templates } from "../types/template.paths";
import { isActiveFeature } from "../utils/feature.flag";

/**
 * Shows 500 page if config flag FEATURE_FLAG_TM01_WEB=false
 */
export const serviceAvailabilityMiddleware = (req: Request, res: Response, next: NextFunction) => {

  if (!isActiveFeature(TM01_ACTIVE)) {
    return res.render(Templates.SERVICE_OFFLINE_MID_JOURNEY, {EWF_URL});
  }

  return next();
};
