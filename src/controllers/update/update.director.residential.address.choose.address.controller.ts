import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import {
  UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
} from "../../types/page.urls";
import {
  getResidentialAddressChooseAddress, postResidentialAddressChooseAddress
} from "../shared.controllers/director.residential.address.choose.address.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getResidentialAddressChooseAddress(req, res, next, Templates.UPDATE_RESIDENTIAL_CHOOSE_ADDRESS, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, true);
};
export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postResidentialAddressChooseAddress(req, res, next, Templates.UPDATE_RESIDENTIAL_CHOOSE_ADDRESS, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, true);
};