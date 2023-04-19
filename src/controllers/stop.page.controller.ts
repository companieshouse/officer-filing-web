import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM } from "../types/page.urls";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { isDissolved } from "../validators/stop.page.validator";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const companyNumber = req.query[URL_QUERY_PARAM.COMPANY_NUM] as string;
    if (isDissolved(companyNumber)) {
        const company: CompanyProfile = await getCompanyProfile(companyNumber);
        return res.render(Templates.STOP_PAGE, {
            company,
            templateName: Templates.STOP_PAGE
          });
    }
 } catch (e) {
    return next(e);
  }
};
