import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    const returnPageUrl = req.headers.referer!

    try {
        return res.render(Templates.ACCESSIBILITY_STATEMENT, {
            templateName: Templates.ACCESSIBILITY_STATEMENT,
            backLinkUrl: returnPageUrl
        });
    } catch (e) {
        return next(e);
    }
}