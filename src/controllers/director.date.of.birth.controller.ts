import { NextFunction, Request, Response } from "express";
import { DIRECTOR_APPOINTED_DATE_PATH, DIRECTOR_NAME_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_DATE_OF_BIRTH, {
      templateName: Templates.DIRECTOR_DATE_OF_BIRTH,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_APPOINTED_DATE_PATH, req);
  return res.redirect(nextPageUrl);
};
