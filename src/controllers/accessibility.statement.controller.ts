import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const returnPageUrl = req.headers.referer!
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    try {
        return res.render(Templates.ACCESSIBILITY_STATEMENT, {
            templateName: Templates.ACCESSIBILITY_STATEMENT,
            backLinkUrl: addLangToUrl(returnPageUrl, lang),
            currentUrl: req.originalUrl,
            ...getLocaleInfo(locales, lang)
        });
    } catch (e) {
        return next(e);
    }
}