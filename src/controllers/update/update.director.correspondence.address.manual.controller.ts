import { NextFunction, Request, Response } from "express";
import {
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { getDirectorCorrespondenceAddressManual, postDirectorCorrespondenceAddressManual } from "../shared.controllers/director.correspondence.address.manual.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  const backLinkUrls = {
    correspondenceAddressSearchPath: UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
    confirmCorrespondenceAddressPath: UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  }
  getDirectorCorrespondenceAddressManual(req, res, next, Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, backLinkUrls);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postDirectorCorrespondenceAddressManual(req, res, next, UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH);
};
