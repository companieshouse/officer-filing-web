import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { TITLE_LIST } from "../utils/properties";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls";

export const get = (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_MANUAL_ADDRESS_LOOKUP, {
      templateName: Templates.DIRECTOR_MANUAL_ADDRESS_LOOKUP,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_PATH, req),
      typehead_array: TITLE_LIST,
    });
  } catch (e) {
    next(e);
  }
};

export const post = (req: Request, res: Response, next: NextFunction) => {
  try {
    const nextPageUrl = urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    next(e);
  }
};

