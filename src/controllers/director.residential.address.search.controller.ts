import { NextFunction, Request, Response } from "express";
import { DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH,
      enterAddressManuallyUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  // Not yet implemented
};
