import { NextFunction, Response } from "express";
import { Templates } from "../types/template.paths";

export const get = async (res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.APPOINT_DIRECTOR_SUBMITTED, {
      templateName: Templates.APPOINT_DIRECTOR_SUBMITTED,
    });
  } catch (e) {
    return next(e);
  }
};
