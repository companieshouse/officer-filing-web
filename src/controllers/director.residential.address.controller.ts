import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, } from '../types/page.urls';

import { getDirectorResidentialAddress, postDirectorResidentialAddress } from "./shared.controllers/director.residential.address.controller";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getDirectorResidentialAddress(req, res, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, false);
}

export const post = (req: Request, res: Response, next: NextFunction) => {
  postDirectorResidentialAddress(req, res, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, false);
}
