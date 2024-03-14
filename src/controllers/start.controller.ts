import { urlUtils } from "../utils/url";
import { OFFICER_FILING } from "../types/page.urls";
import { Request, Response } from "express";
import { selectLang, getLocalesService, getLocaleInfo } from "../utils/localise";
import {
  CHS_URL,
  PIWIK_START_GOAL_ID,
  EWF_URL,
  TM01_ACTIVE,
  AP01_ACTIVE,
  CH01_ACTIVE
} from "../utils/properties";
import { Templates } from "../types/template.paths";

export const get = (req: Request, res: Response) => {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

  return res.render(Templates.START, { CHS_URL,
    ...getLocaleInfo(locales, lang),
    currentUrl: urlUtils.getUrlToPath(OFFICER_FILING, req),
    lang,
    PIWIK_START_GOAL_ID,
    TM01_ACTIVE,
    AP01_ACTIVE,
    CH01_ACTIVE,
    EWF_URL,
    templateName: Templates.START });
};
