import { getDirectorResidentialAddressSearch, postDirectorResidentialAddressSearch } from "./shared.controllers/director.residential.address.search.controller"
import { NextFunction, Request, Response } from "express"
import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls"
import { Templates } from "../types/template.paths"

export const get = (req: Request, resp: Response, next: NextFunction) => {
  getDirectorResidentialAddressSearch(req, resp, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, { backLinkWhenCompleteROA: DIRECTOR_RESIDENTIAL_ADDRESS_PATH, backLinkWhenIncompleteROA: DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, manualEntryLink: DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH }, false);
}

export const post = async (req: Request, resp: Response, next: NextFunction) => {
  postDirectorResidentialAddressSearch(req, resp, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, { backLinkWhenCompleteROA: DIRECTOR_RESIDENTIAL_ADDRESS_PATH, backLinkWhenIncompleteROA: DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, manualEntryLink: DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH }, false);
};