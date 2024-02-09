import { NextFunction, Request, Response } from "express";
import { UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../../types/page.urls";
import { Templates } from "../../types/template.paths";
import { getResidentialLink, postResidentialLink } from "../shared.controllers/director.residential.address.link.controller";


export const get = async (req: Request, res: Response, next: NextFunction) => {
  getResidentialLink(req, res, next, Templates.UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH, true)
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  postResidentialLink(req, res, next, Templates.UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH, true)
};
