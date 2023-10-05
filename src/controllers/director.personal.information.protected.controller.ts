import { NextFunction, Request, Response } from "express";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from '../types/page.urls';
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_PERSONAL_INFORMATION, {
      templateName: Templates.DIRECTOR_PERSONAL_INFORMATION,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const nextPageUrl = urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

