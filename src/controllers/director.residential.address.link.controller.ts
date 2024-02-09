import { NextFunction, Request, Response } from "express";
import { DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { getResidentialLink, postResidentialLink } from "./shared.controllers/director.residential.address.link.controller";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  getResidentialLink(req, res, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_LINK, DIRECTOR_RESIDENTIAL_ADDRESS_PATH, false)
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postResidentialLink(req, res, next, Templates.DIRECTOR_RESIDENTIAL_ADDRESS_LINK, DIRECTOR_RESIDENTIAL_ADDRESS_PATH, false)
};
