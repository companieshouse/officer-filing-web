import { NextFunction, Request, Response } from "express";
import { CURRENT_DIRECTORS_PATH, DIRECTOR_DATE_DETAILS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { getDirectorName, postDirectorName } from "./shared.controllers/director.name.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  getDirectorName(req, res, next, Templates.DIRECTOR_NAME, CURRENT_DIRECTORS_PATH)
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postDirectorName(req, res, next, DIRECTOR_DATE_DETAILS_PATH, false)
};
