import { Request, Response } from "express";
import { CHS_URL, PIWIK_START_GOAL_ID, FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021, EWF_URL } from "../utils/properties";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response) => {
  return res.render(Templates.START, { CHS_URL,
    PIWIK_START_GOAL_ID,
    FEATURE_FLAG_FIVE_OR_LESS_OFFICERS_JOURNEY_21102021,
    EWF_URL,
    templateName: Templates.START });
};
