import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { getCorrespondenceAddressLookUp, postCorrespondenceAddressLookUp } from "./shared.controllers/director.correspondence.address.search.controller";

export const get = (req: Request, res: Response, next: NextFunction) => {
  return getCorrespondenceAddressLookUp(req, res, next, 
                                        Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, 
                                        DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, 
                                        DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, false);
}

export const post = async (req: Request, res: Response, next: NextFunction) => {
  return postCorrespondenceAddressLookUp(req, res, next, false);
}