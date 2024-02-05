import { NextFunction, Request, Response } from "express"
import { getCorrespondenceAddressLookUp } from "../../controllers/shared.controllers/director.correspondence.address.search.controller";
import { UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH } from "../../types/page.urls";
import { Templates } from '../../types/template.paths';
import { postCorrespondenceAddressLookUp } from '../shared.controllers/director.correspondence.address.search.controller';

export const get = (req: Request, res: Response, next: NextFunction) => {
  return getCorrespondenceAddressLookUp(req, res, next, 
                                        Templates.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, 
                                        UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, 
                                        UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH)
}

export const post = (req: Request, res: Response, next: NextFunction) => {
  return postCorrespondenceAddressLookUp(req, res, next, true);
}