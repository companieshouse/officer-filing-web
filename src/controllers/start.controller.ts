import { urlUtils } from "../utils/url";
import { OFFICER_FILING } from "../types/page.urls";
import { Request, Response } from "express";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { selectLang, getLocalesService, addLangToUrl, getLocaleInfo } from "../utils/localise";
import {
  CHS_URL,
  PIWIK_START_GOAL_ID,
  FEATURE_FLAG_REMOVE_DIRECTOR_20022023,
  EWF_URL,
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
    PIWIK_START_GOAL_ID,
    FEATURE_FLAG_REMOVE_DIRECTOR_20022023,
    AP01_ACTIVE,
    CH01_ACTIVE,
    EWF_URL,
    templateName: Templates.START });
};
