import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import {
  getCorrespondenceAddressChooseAddress, postCorrespondenceAddressChooseAddress
} from "./shared.controllers/director.correspondence.address.choose.address.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getCorrespondenceAddressChooseAddress(req, res, next, Templates.DIRECTOR_CORRESPONDENCE_CHOOSE_ADDRESS, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, false);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postCorrespondenceAddressChooseAddress(req, res, next, Templates.DIRECTOR_CORRESPONDENCE_CHOOSE_ADDRESS, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, false);
};