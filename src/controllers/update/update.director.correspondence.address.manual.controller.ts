import { UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH } from './../../types/page.urls';
import { getCorrespondenceManualAddress } from "controllers/shared.controllers/director.correspondence.address.manual.controller"
import { NextFunction, Request, Response } from "express"
import { Templates } from 'types/template.paths';
import { DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL } from '../../types/page.urls';

export const get = (req: Request, res: Response, next: NextFunction) => {
  return getCorrespondenceManualAddress(req, res, next, Templates.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, true)
}

export const post = (req: Request, res: Response, next: NextFunction) => {

}