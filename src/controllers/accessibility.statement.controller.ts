import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlUtils, getPreviousPageQueryParamUrl } from "../utils/url";
import { ACCESSIBILITY_STATEMENT_PATH } from "../types/page.urls";
import { logger } from "../utils/logger";

import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const lang = selectLang(req.query.lang);
  const locales = getLocalesService();

  const returnPage = addLangToUrl(getPreviousPageQueryParamUrl(req), lang);
  logger.debugRequest(req, "Accessibility statement return page is " + returnPage);

  const returnPageEncoded = encodeURIComponent(returnPage);

  try {
    return res.render(Templates.ACCESSIBILITY_STATEMENT, {
      templateName: Templates.ACCESSIBILITY_STATEMENT,
      backLinkUrl: returnPage,
      // currentUrl: req.originalUrl + "?previousPage=" + returnPageEncoded,
      currentUrl: urlUtils.getUrlToPath(ACCESSIBILITY_STATEMENT_PATH, req) + "?previousPage=" + returnPageEncoded,
      ...getLocaleInfo(locales, lang)
    });
  } catch (e) {
    return next(e);
  }
}