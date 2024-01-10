
import { NextFunction, Request, Response } from "express"
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_NATIONALITY_PATH } from "../types/page.urls"
import { Templates } from "../types/template.paths"
import { getDirectorOccupation, postDirectorOccupation } from "./shared.controllers/director.occupation.controller";

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorOccupation(req, resp, next, Templates.UPDATE_DIRECTOR_OCCUPATION, DIRECTOR_NATIONALITY_PATH);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  postDirectorOccupation(req, resp, next, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, false);
};
