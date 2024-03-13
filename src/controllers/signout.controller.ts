import { Handler, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { ACCOUNTS_SIGNOUT_PATH, OFFICER_FILING, SIGNOUT_PATH } from "../types/page.urls";
import { logger } from "../utils/logger";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";
import { urlUtils } from "../utils/url";

export const get: Handler = async (req, res) => {

  const lang = selectLang(req.query.lang);
  const previousPageParam = req.params["previousPage"];
  const returnPage = addLangToUrl(previousPageParam ?? getPreviousPageUrl(req), lang);
  
  const locales = getLocalesService();
  const returnPageEncoded = encodeURIComponent(returnPage);
  
  logger.debugRequest(req, "Signout return page is " + returnPage);

  res.render(Templates.SIGNOUT, {
    backLinkUrl: returnPage,
    previousPage: returnPage,
    templateName: Templates.SIGNOUT,
    currentUrl: urlUtils.getUrlToPath(SIGNOUT_PATH, req) + "?previousPage=" + returnPageEncoded,
    ...getLocaleInfo(locales, lang)
  });
};

export const post = (req, res) => {

  const lang = selectLang(req.query.lang);
  const previousPageParam = req.body["previousPage"];
  const previousPage = addLangToUrl(previousPageParam ?? OFFICER_FILING, lang);

  logger.debugRequest(req, "Signout previous page in current lang is " + previousPage);

  switch (req.body.signout) {
    case "yes":
      return res.redirect(addLangToUrl(ACCOUNTS_SIGNOUT_PATH, lang));
    case "no":
      return safeRedirect(res, previousPage);
    default:
      return showMustSelectButtonError(res, req, lang, previousPage);
  }
};

const getPreviousPageUrl = (req: Request) => {
  const headers = req.rawHeaders;
  const absolutePreviousPageUrl = headers.filter(item => item.includes(OFFICER_FILING))[0];
  if (!absolutePreviousPageUrl) {
    return OFFICER_FILING;
  }

  const indexOfRelativePath = absolutePreviousPageUrl.indexOf(OFFICER_FILING);
  const relativePreviousPageUrl = absolutePreviousPageUrl.substring(indexOfRelativePath);

  logger.debugRequest(req, `Relative previous page URL is ${relativePreviousPageUrl}`);
  return relativePreviousPageUrl;
};

export const safeRedirect = (res: Response, url: string): void => {
  if (url.startsWith(OFFICER_FILING)) {
    return res.redirect(url);
  }

  throw new Error('Security failure with URL ' + url);
};

const showMustSelectButtonError = (res: Response, req: Request, lang: string, returnPage: string) => {
  const locales = getLocalesService();
  const returnPageEncoded = encodeURIComponent(returnPage);

  res.status(400);
  return res.render(Templates.SIGNOUT, {
    backLinkUrl: returnPage,
    previousPage: returnPage,
    noInputSelectedError: true,
    templateName: Templates.SIGNOUT,
    currentUrl: urlUtils.getUrlToPath(SIGNOUT_PATH, req) + "?previousPage=" + returnPageEncoded,
    ...getLocaleInfo(locales, lang)
   });
};
