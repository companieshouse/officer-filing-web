import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import {
  getResidentialAddressChooseAddress, postResidentialAddressChooseAddress
} from "./shared.controllers/director.residential.address.choose.address.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  await getResidentialAddressChooseAddress(req, res, next, Templates.DIRECTOR_RESIDENTIAL_CHOOSE_ADDRESS, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, false);
}

export const post = async (req: Request, res: Response, next: NextFunction) => {
  await postResidentialAddressChooseAddress(req, res, next, Templates.DIRECTOR_RESIDENTIAL_CHOOSE_ADDRESS, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, false);
}
