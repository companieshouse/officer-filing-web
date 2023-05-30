import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { COMPANY_LOOKUP, CREATE_TRANSACTION_PATH, SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { buildAddress, formatForDisplay } from "../services/confirm.company.service";
import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { STOP_TYPE } from "../utils/constants";

export const isValidUrl = (url: string) => { 
  return url.startsWith("/officer-filing-web")
};

export const isValidCompanyNumber = (companyNumber: string) => {
  var pattern= "^[a-zA-Z0-9]*$";
  return (companyNumber.length <= 20 && companyNumber.match(pattern));
}

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

    const pageOptions = await buildPageOptions(session, companyProfile);
    return res.render(Templates.CONFIRM_COMPANY, pageOptions);
    
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

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const session: Session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

    var nextPageUrl = urlUtils.setQueryParam(SHOW_STOP_PAGE_PATH, URL_QUERY_PARAM.COMPANY_NUM, companyNumber);
    if (await getCurrentOrFutureDissolved(session, companyNumber)){
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED);
    }
    else if(companyProfile.type !== "private-unlimited" && companyProfile.type !== "ltd" &&  companyProfile.type !== "plc"){
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.LIMITED_UNLIMITED);
    }
    else{
      await createNewOfficerFiling(session);
      if(!isValidCompanyNumber(companyNumber)){
        throw Error("Company number is invalid, should be an alphanumeric string of a maximum 20 characters");
      }
      nextPageUrl = urlUtils.getUrlWithCompanyNumber(CREATE_TRANSACTION_PATH, companyNumber);
    }

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
