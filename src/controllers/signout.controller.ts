import { Handler, NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { SIGNOUT_RETURN_URL_SESSION_KEY } from "../utils/constants";
import { Session } from "@companieshouse/node-session-handler";
import { ACCOUNTS_SIGNOUT_PATH } from "../types/page.urls";
import { logger } from "../utils/logger";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

export const get: Handler = async (req, res) => {
    const returnPage = saveReturnPageInSession(req);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    res.render(Templates.SIGNOUT, {
        backLinkUrl: returnPage,
        templateName: Templates.SIGNOUT,
        currentUrl: req.originalUrl,
        ...getLocaleInfo(locales, lang)
    });
}

export const post = handleError(async (req, res) => {
    const returnPage = getReturnPageFromSession(req.session as Session)
    const lang = selectLang(req.query.lang);

    switch (req.body.signout) {
    case "yes":
        return res.redirect(addLangToUrl(ACCOUNTS_SIGNOUT_PATH, lang));
    case "no":
        return res.redirect(returnPage);
    default:
        return renderPage(res, req, returnPage);
    }
})

export const renderPage = (res: Response, req: Request, returnPage: string) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    res.render(Templates.SIGNOUT, {
        backLinkUrl: returnPage,
        noInputSelectedError: true,
        templateName: Templates.SIGNOUT,
        currentUrl: req.originalUrl,
        ...getLocaleInfo(locales, lang)
    });
}

// Async version of express handler so that static analysers don't complain that an await statement 
// isn't needed when it is.
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

// Wraps a handler function to catch any exceptions and pass them to the next handler in the chain.
function handleError(handler: AsyncHandler): AsyncHandler {
    return async (req, res, next) => {
        try {
            await handler(req, res, next)
        } catch (e) {
            next(e);
        }
    }
}

function showMustSelectButtonError(res: Response, req: Request, returnPage: string) {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    res.status(400);
    return res.render(Templates.SIGNOUT, {
        backLinkUrl: returnPage,
        noInputSelectedError: true,
        templateName: Templates.SIGNOUT,
        currentUrl: req.originalUrl,
        ...getLocaleInfo(locales, lang)
    });
}

function saveReturnPageInSession(req: Request): string {
    const lang = selectLang(req.query.lang);
    const returnPageUrl = req.headers.referer!;
    req.session?.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, addLangToUrl(returnPageUrl, lang));
    return addLangToUrl(returnPageUrl, lang);
}

function getReturnPageFromSession(session: Session): string {
    const returnPage = session?.getExtraData(SIGNOUT_RETURN_URL_SESSION_KEY)
    if (returnPage !== undefined && typeof returnPage === 'string') return returnPage

    logger.error(`Unable to find page to return the user to. ` 
        + `It should have been a string value stored in the session extra data with key ${SIGNOUT_RETURN_URL_SESSION_KEY}. ` 
        + `However, ${JSON.stringify(returnPage)} was there instead.`)

    throw new Error(`Cannot find url of page to return user to.`)
}