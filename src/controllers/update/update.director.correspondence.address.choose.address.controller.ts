import {NextFunction, Request, Response} from "express";
import {
  getCorrespondenceAddressChooseAddress, postCorrespondenceAddressChooseAddress
} from "../shared.controllers/director.correspondence.address.choose.address.controller";
import {Templates} from "../../types/template.paths";
import {
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
} from "../../types/page.urls";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getCorrespondenceAddressChooseAddress(req, res, next, Templates.UPDATE_RESIDENTIAL_CHOOSE_ADDRESS, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, true);
};
export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postCorrespondenceAddressChooseAddress(req, res, next, Templates.UPDATE_RESIDENTIAL_CHOOSE_ADDRESS, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, true);
};