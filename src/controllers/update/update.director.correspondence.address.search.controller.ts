import { getCorrespondenceAddressLookUp } from "controllers/shared.controllers/director.correspondence.address.search.controller";
import { NextFunction, Request, Response } from "express"
import { UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH } from "types/page.urls";
import { Templates } from 'types/template.paths';

export const get = (req: Request, res: Response, next: NextFunction) => {
  return getCorrespondenceAddressLookUp(req, res, next, Templates.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, true)
}

export const post = (req: Request, res: Response, next: NextFunction) => {

}