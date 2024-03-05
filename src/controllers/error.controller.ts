import { Handler, NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";
import { Templates } from "../types/template.paths";
import { selectLang, getLocalesService, getLocaleInfo } from "../utils/localise";
import { urlUtils } from "../utils/url";
import { SERVICE_ERROR_PATH } from "../types/page.urls";

export const pageNotFound = (req: Request, res: Response) => {
  return res.status(404).render(Templates.ERROR_404, { templateName: Templates.ERROR_404 });
  };

/**
 * This handler catches any other error thrown within the application.
 * Use this error handler by calling next(e) from within a controller
 * Always keep this as the last handler in the chain for it to work.
 */
export const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {

  logger.errorRequest(req, `An error has occurred. Re-routing to the error screen - ${err.stack}`);

  errorPage(req, res);
};

export const get: Handler = (req: Request, res: Response) => {
  errorPage(req, res);
};

const errorPage = (req: Request, res: Response) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();

  res.status(500).render(Templates.SERVICE_OFFLINE_MID_JOURNEY,
    {
      ...getLocaleInfo(locales, lang),
      currentUrl:  urlUtils.getUrlToPath(SERVICE_ERROR_PATH, req),
      templateName: Templates.SERVICE_OFFLINE_MID_JOURNEY
    });
};
