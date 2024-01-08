import { getDirectorName, postDirectorName } from "../../controllers/shared.controllers/director.name.controller"
import { NextFunction, Request, Response } from "express"
import { UPDATE_DIRECTOR_DETAILS_PATH, BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM } from "../../types/page.urls"
import { Templates } from "../../types/template.paths"

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorName(req, resp, next, Templates.UPDATE_DIRECTOR_NAME, UPDATE_DIRECTOR_DETAILS_PATH, true);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  postDirectorName(req, resp, next, UPDATE_DIRECTOR_DETAILS_PATH, true);
};
