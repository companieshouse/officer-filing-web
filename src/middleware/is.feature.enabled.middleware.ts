import { NextFunction, Request, Response } from "express";
import { constants } from 'http2';
import { isActiveFeature } from "../utils/feature.flag";
import { Templates } from "../types/template.paths";

export const isFeatureEnabled = (featureFlagValue: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!isActiveFeature(featureFlagValue)) {
      return res
        .status(constants.HTTP_STATUS_NOT_FOUND)
        .render(Templates.SERVICE_OFFLINE_MID_JOURNEY);
    }

    // feature is available - show
    return next();
  };
};
