import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { getConfirmCorrespondence, postConfirmCorrespondence } from "./shared.controllers/director.confirm.correspondence.address.controller";
import { DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH } from "../types/page.urls";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    getConfirmCorrespondence(req, res, next, Templates.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, false)}

export const post = async (req: Request, res: Response, next: NextFunction) => {   
    postConfirmCorrespondence(req, res, next, DIRECTOR_RESIDENTIAL_ADDRESS_PATH, false)}

