import { getDirectorOccupation, postDirectorOccupation } from "../shared.controllers/director.occupation.controller"
import { NextFunction, Request, Response } from "express"
import { UPDATE_DIRECTOR_DETAILS_PATH } from "../../types/page.urls"
import { Templates } from "../../types/template.paths"

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorOccupation(req, resp, next, Templates.UPDATE_DIRECTOR_OCCUPATION, UPDATE_DIRECTOR_DETAILS_PATH, true);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  postDirectorOccupation(req, resp, next, UPDATE_DIRECTOR_DETAILS_PATH, true);
};
