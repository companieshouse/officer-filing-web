import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  let returnPageUrl = req.headers.referer!;
  if(returnPageUrl?.endsWith(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END)) {
    returnPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, req);
  } else {
    returnPageUrl = urlUtils.getUrlToPath(DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH, req);
  }
  try {
    return res.render(Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, {
      templateName: Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS,
      backLinkUrl: returnPageUrl,
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  const nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_PROTECTED_DETAILS_PATH, req);
  return res.redirect(nextPageUrl);
};
