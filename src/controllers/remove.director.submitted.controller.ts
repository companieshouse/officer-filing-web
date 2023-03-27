import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.REMOVE_DIRECTOR_SUBMITTED, {
      templateName: Templates.REMOVE_DIRECTOR_SUBMITTED,
    });
  } catch (e) {
    return next(e);
  }
};
