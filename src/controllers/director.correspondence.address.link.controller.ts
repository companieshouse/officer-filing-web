import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { getCorrespondenceLink, postCorrespondenceLink } from "./shared.controllers/director.correspondence.link.controller";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  getCorrespondenceLink(req, res, next, Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH)
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postCorrespondenceLink(req, res, next, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH,  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH)
};

