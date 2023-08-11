import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, DIRECTOR_OCCUPATION_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, {
      templateName: Templates.DIRECTOR_CORRESPONDENCE_ADDRESS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_OCCUPATION_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, req);
  return res.redirect(nextPageUrl);
};
