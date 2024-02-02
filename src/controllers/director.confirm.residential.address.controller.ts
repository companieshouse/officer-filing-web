import { NextFunction, Request, Response } from "express";
import {
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
} from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { getDirectorConfirmResidentialAddress, postDirectorConfirmResidentialAddress } from "./shared.controllers/director.confirm.residential.address.controller";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  getDirectorConfirmResidentialAddress(req, res, next, Templates.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH);
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postDirectorConfirmResidentialAddress(req, res, next, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_PROTECTED_DETAILS_PATH);
};