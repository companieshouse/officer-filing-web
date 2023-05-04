import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { COMPANY_LOOKUP, CREATE_TRANSACTION_PATH, SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { buildAddress, formatForDisplay } from "../services/confirm.company.service";
import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

    if (await getCurrentOrFutureDissolved(session, companyNumber)){
      res.redirect(urlUtils.setQueryParam(SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM.COMPANY_NUM, companyNumber));
    }
    else {
      const pageOptions = await buildPageOptions(session, companyProfile);
      return res.render(Templates.CONFIRM_COMPANY, pageOptions);
    }

  } catch (e) {
    return next(e);
  }
};

const buildPageOptions = async (session: Session, companyProfile: CompanyProfile): Promise<Object> => {
  companyProfile = formatForDisplay(companyProfile);
  var addressArray: string[] = [companyProfile.registeredOfficeAddress.poBox,
    companyProfile.registeredOfficeAddress.premises, companyProfile.registeredOfficeAddress.addressLineOne,
    companyProfile.registeredOfficeAddress.addressLineTwo, companyProfile.registeredOfficeAddress.locality,
    companyProfile.registeredOfficeAddress.region, companyProfile.registeredOfficeAddress.country,
    companyProfile.registeredOfficeAddress.postalCode]
  const address = buildAddress(addressArray);
  return {
    company: companyProfile,
    address: address,
    templateName: Templates.CONFIRM_COMPANY,
    backLinkUrl: COMPANY_LOOKUP.replace("{","%7B").replace("}","%7D")
  };
};

export const isValidUrl = (url: string) => { 
  return url.startsWith("/officer-filing-web/company")
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;

    await createNewOfficerFiling(session);

    const companyNumber = req.query.companyNumber as string;
    const nextPageUrl = urlUtils.getUrlWithCompanyNumber(CREATE_TRANSACTION_PATH, companyNumber);
    if(isValidUrl(nextPageUrl)) {
      return res.redirect(nextPageUrl);
    } else {
      throw Error("URL to redirect to (" + nextPageUrl + ") was not valid");
    }
  } catch (e) {
    return next(e);
  }
};

const createNewOfficerFiling = async (session: Session) => {
    const transactionId: string = "";
};
