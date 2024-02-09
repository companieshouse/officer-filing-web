import { NextFunction, Request, Response } from "express";
import { Templates } from "../../types/template.paths";
import { getConfirmCorrespondence, postConfirmCorrespondence } from "../../controllers/shared.controllers/director.confirm.correspondence.address.controller";
import { UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH } from "../../types/page.urls";

export const get = async (req: Request, res: Response, next: NextFunction) => {
    getConfirmCorrespondence(req, res, next, Templates.UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, true)}

export const post = async (req: Request, res: Response, next: NextFunction) => {   
    postConfirmCorrespondence(req, res, next, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH, true)}
