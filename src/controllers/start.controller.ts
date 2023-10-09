import { Request, Response } from "express";
import { CHS_URL, PIWIK_START_GOAL_ID, FEATURE_FLAG_REMOVE_DIRECTOR_20022023, EWF_URL, AP01_ACTIVE } from "../utils/properties";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.START, { CHS_URL,
    PIWIK_START_GOAL_ID,
    FEATURE_FLAG_REMOVE_DIRECTOR_20022023,
    AP01_ACTIVE,
    EWF_URL,
    templateName: Templates.START });
};
