import { NextFunction, Request, Response } from "express"
import { getResidentialAddressManualEntry, postResidentialAddressManualEntry } from "../../controllers/shared.controllers/director.residential.address.manual.controller"
import { UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH } from "../../types/page.urls"
import { Templates } from "../../types/template.paths"


export const get = (req: Request, res: Response, next: NextFunction) => {
  getResidentialAddressManualEntry(req, res, next, Templates.UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH)
}

export const post = (req: Request, res: Response, next: NextFunction) => {
  postResidentialAddressManualEntry(req, res, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH);
}