import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { getCorrespondenceLink, postCorrespondenceLink } from "./shared.controllers/director.correspondence.address.link.controller";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  getCorrespondenceLink(req, res, next, Templates.DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, false)
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postCorrespondenceLink(req, res, next, Templates.DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, {yes: DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, no: DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH}, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,false)
};
