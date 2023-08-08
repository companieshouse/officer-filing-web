import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return res.render(Templates.ACCESSIBILITY_STATEMENT);
    } catch (e) {
        return next(e);
    }
}