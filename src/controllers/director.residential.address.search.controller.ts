import { getDirectorResidentialAddressSearch, postDirectorResidentialAddressSearch } from "./shared.controllers/director.residential.address.search.controller"
import { NextFunction, Request, Response } from "express"
import { DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls"
import { Templates } from "../types/template.paths"

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorResidentialAddressSearch(req, resp, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH, false);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  postDirectorResidentialAddressSearch(req, resp, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH, false);
};