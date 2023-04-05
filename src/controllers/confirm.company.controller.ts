import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import {
  CREATE_TRANSACTION_PATH
} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { toReadableFormat } from "../utils/date";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.CONFIRM_COMPANY);
  } catch (e) {
    return next(e);
  }
};

const buildPageOptions = async (session: Session, companyProfile: CompanyProfile): Promise<Object> => {
  const pageOptions = {
    templateName: Templates.CONFIRM_COMPANY
  };

  return pageOptions;
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;

    await createNewOfficerFiling(session);
    const nextPageUrl = urlUtils.getUrlWithCompanyNumber(CREATE_TRANSACTION_PATH, "01777777");
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

const createNewOfficerFiling = async (session: Session) => {
    const transactionId: string = "";
};

