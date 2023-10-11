import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {

  try {
    return res.render(Templates.DIRECTOR_RESIDENTIAL_CHOOSE_ADDRESS, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_CHOOSE_ADDRESS,
      confirmAddressUrl: urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, req),
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req),
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, req);
  return res.redirect(nextPageUrl);
};
