import { getDirectorResidentialAddressSearch, postDirectorResidentialAddressSearch } from "../shared.controllers/director.residential.address.search.controller"
import { NextFunction, Request, Response } from "express"
import { UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH } from "../../types/page.urls"
import { Templates } from "../../types/template.paths"

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorResidentialAddressSearch(req, resp, next, Templates.UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, {backLink: UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, manualEntryLink: UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH}, true);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  postDirectorResidentialAddressSearch(req, resp, next, Templates.UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, {backLink: UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, manualEntryLink: UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH}, true);
};