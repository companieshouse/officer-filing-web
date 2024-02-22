import { NextFunction, Request, Response } from "express";
import { getResidentialAddressManualEntry, postResidentialAddressManualEntry } from "./shared.controllers/director.residential.address.manual.controller";
import { DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response, next: NextFunction) => {
  getResidentialAddressManualEntry(req, res, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, false)
}

export const post = (req: Request, res: Response, next: NextFunction) => {
  postResidentialAddressManualEntry(req, res, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, false);
}