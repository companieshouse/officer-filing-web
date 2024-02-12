import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { getCorrespondenceLink, postCorrespondenceLink } from "../shared.controllers/director.correspondence.address.link.controller";
import {
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
} from "../../types/page.urls";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getCorrespondenceLink(req, res, next, Templates.UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, true)
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postCorrespondenceLink(req, res, next, Templates.UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, {yes: UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, no: UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH}, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,true)
};
