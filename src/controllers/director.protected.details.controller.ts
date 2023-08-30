import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_PROTECTED_DETAILS, {
      templateName: Templates.DIRECTOR_PROTECTED_DETAILS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req);
  return res.redirect(nextPageUrl);
};
