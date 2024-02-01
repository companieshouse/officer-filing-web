import { getDirectorCorrespondenceAddress, postDirectorCorrespondenceAddress } from "../shared.controllers/director.correspondence.address.controller"
import { NextFunction, Request, Response } from "express"
import { UPDATE_DIRECTOR_DETAILS_PATH } from "../../types/page.urls"
import { Templates } from "../../types/template.paths"

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorCorrespondenceAddress(req, resp, next, Templates.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS, UPDATE_DIRECTOR_DETAILS_PATH);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  postDirectorCorrespondenceAddress(req, resp, next, Templates.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS, UPDATE_DIRECTOR_DETAILS_PATH, true);
};
