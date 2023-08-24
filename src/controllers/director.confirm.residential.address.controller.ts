import { NextFunction, Request, Response } from "express";
import { DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, DIRECTOR_PROTECTED_DETAILS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, {
      templateName: Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req);
  return res.redirect(nextPageUrl);
};
