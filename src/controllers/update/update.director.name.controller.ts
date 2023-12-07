import { getDirectorName, postDirectorName } from "../../controllers/shared.controllers/director.name.controller"
import { NextFunction, Request, Response } from "express"
import { CURRENT_DIRECTORS_PATH, UPDATE_DIRECTOR_NAME_PATH } from "../../types/page.urls"
import { Templates } from "../../types/template.paths"
import { DIRECTOR_DATE_DETAILS_PATH } from '../../types/page.urls';

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorName(req, resp, next, Templates.UPDATE_DIRECTOR_NAME, UPDATE_DIRECTOR_NAME_PATH, true);
}

export const post = (req: Request, resp: Response, next: NextFunction) => {
  postDirectorName(req, resp, next, DIRECTOR_DATE_DETAILS_PATH);
}