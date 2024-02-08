import { NextFunction, Request, Response } from "express";
import {
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  UPDATE_DIRECTOR_CHECK_ANSWERS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  UPDATE_DIRECTOR_DETAILS_PATH,
} from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { getDirectorConfirmResidentialAddress, postDirectorConfirmResidentialAddress } from "../shared.controllers/director.confirm.residential.address.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  getDirectorConfirmResidentialAddress(req, res, next, Templates.UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postDirectorConfirmResidentialAddress(req, res, next, UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, UPDATE_DIRECTOR_DETAILS_PATH);
};