import { NextFunction, Request, Response } from "express";
import { CURRENT_DIRECTORS_PATH, DIRECTOR_DATE_OF_BIRTH_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_NAME, {
      templateName: Templates.DIRECTOR_NAME,
      backLinkUrl: urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_DATE_OF_BIRTH_PATH, req);
  return res.redirect(nextPageUrl);
};