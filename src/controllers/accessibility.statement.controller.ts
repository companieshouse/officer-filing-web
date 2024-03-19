import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { OFFICER_FILING } from "../types/page.urls";
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
            currentUrl: req.originalUrl + "?previousPage=" + returnPageEncoded,
            ...getLocaleInfo(locales, lang)
        });
    } catch (e) {
        return next(e);
    }
}

export const getPreviousPageQueryParamUrl = (req: Request) => {
    const previousPageQueryParam = req.query.previousPage;
    return previousPageQueryParam && typeof previousPageQueryParam === 'string' ? previousPageQueryParam : getPreviousPageUrl(req)
};

const getPreviousPageUrl = (req: Request) => {
    const headers = req.rawHeaders;
    const absolutePreviousPageUrl = headers.filter(item => item.includes(OFFICER_FILING))[0];
    if (!absolutePreviousPageUrl) {
        return OFFICER_FILING;
    }

    const indexOfRelativePath = absolutePreviousPageUrl.indexOf(OFFICER_FILING);
    return absolutePreviousPageUrl.substring(indexOfRelativePath);
};