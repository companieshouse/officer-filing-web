import { NextFunction, Request, Response } from "express";
import { DIRECTOR_DATE_DETAILS_PATH, DIRECTOR_OCCUPATION_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { getDirectorNationality, postDirectorNationality } from "./shared.controllers/director.nationality.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  getDirectorNationality(req, res, next, Templates.DIRECTOR_NATIONALITY, DIRECTOR_DATE_DETAILS_PATH)
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postDirectorNationality(req, res, next, DIRECTOR_OCCUPATION_PATH, false)
};
