import { getDirectorCorrespondenceAddress, postDirectorCorrespondenceAddress } from "./shared.controllers/director.correspondence.address.controller"
import { NextFunction, Request, Response } from "express"
import {  DIRECTOR_OCCUPATION_PATH } from "../types/page.urls"
import { Templates } from "../types/template.paths"

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorCorrespondenceAddress(req, resp, next, Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, DIRECTOR_OCCUPATION_PATH);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  postDirectorCorrespondenceAddress(req, resp, next, Templates.DIRECTOR_CORRESPONDENCE_ADDRESS, DIRECTOR_OCCUPATION_PATH);
};
