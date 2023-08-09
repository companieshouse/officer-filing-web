import { NextFunction, Request, Response } from "express";
import { DIRECTOR_APPOINTED_DATE_PATH, DIRECTOR_NATIONALITY_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_OCCUPATION, {
      templateName: Templates.DIRECTOR_OCCUPATION,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_APPOINTED_DATE_PATH, req);
  return res.redirect(nextPageUrl);
};
