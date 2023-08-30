import { NextFunction, Request, Response } from "express";
import { DIRECTOR_PROTECTED_DETAILS_PATH, APPOINT_DIRECTOR_SUBMITTED_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.APPOINT_DIRECTOR_CHECK_ANSWERS, {
      templateName: Templates.APPOINT_DIRECTOR_CHECK_ANSWERS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(APPOINT_DIRECTOR_SUBMITTED_PATH, req);
  return res.redirect(nextPageUrl);
};
