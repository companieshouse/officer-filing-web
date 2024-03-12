import { NextFunction, Request, Response } from "express"
import { UPDATE_DIRECTOR_DETAILS_PATH, UPDATE_DIRECTOR_NATIONALITY_PATH } from "../../types/page.urls"
import { Templates } from "../../types/template.paths"
import { getDirectorNationality, postDirectorNationality } from "../../controllers/shared.controllers/director.nationality.controller"


export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorNationality(req, resp, next, Templates.UPDATE_DIRECTOR_NATIONALITY, UPDATE_DIRECTOR_DETAILS_PATH, true)
}

export const post = (req: Request, resp: Response, next: NextFunction) => {
  postDirectorNationality(req, resp, next, UPDATE_DIRECTOR_DETAILS_PATH, true);
}