import { Request, Response } from "express";
import { COMPANY_LOOKUP, COMPANY_LOOKUP_WITH_LANG } from "../types/page.urls";
import { selectLang } from "../utils/localise";
import { logger } from "../utils/logger";

export const get = (req: Request, res: Response) => {
  const lang = req.query.lang;
  if (lang != undefined && lang != "") {
    const companyLookup = COMPANY_LOOKUP_WITH_LANG + selectLang(lang);
    logger.debug("Company number redirect: " + companyLookup);
    return res.redirect(companyLookup);
  }
  return res.redirect(COMPANY_LOOKUP);
};
