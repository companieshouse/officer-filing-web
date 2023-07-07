import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CompanyOfficers, CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/company-officers/types";
import { Session } from "@companieshouse/node-session-handler";
import { BASIC_STOP_PAGE_PATH, COMPANY_LOOKUP, CREATE_TRANSACTION_PATH, URL_QUERY_PARAM, urlParams} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { getCompanyOfficers } from "../services/company.officers.service";
import { buildAddress, formatForDisplay } from "../services/confirm.company.service";
import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { STOP_TYPE } from "../utils/constants";

export const isValidUrl = (url: string) => { 
  return url.startsWith("/officer-filing-web")
};

export const redirectToUrl = (url: string, res: Response) => { 
  if(isValidUrl(url)) {
    return res.redirect(url);
  } else {
    throw Error("URL to redirect to (" + url + ") was not valid");
  }
};

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
    req.params[urlParams.PARAM_COMPANY_NUMBER] = companyNumber;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    const companyOfficers: CompanyOfficers = await getCompanyOfficers(companyNumber);

    var nextPageUrl = urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req);
    if (await getCurrentOrFutureDissolved(session, companyNumber)){
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED);
    }
    else if(companyProfile.type !== "private-unlimited" && companyProfile.type !== "ltd" &&  companyProfile.type !== "plc"){
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.LIMITED_UNLIMITED);
    }
    // get number of active directors - if none go straight to stop screen and do not create transaction
    else if(await companyHasNoDirectors(companyOfficers)){
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.NO_DIRECTORS);
    }
    else{
      await createNewOfficerFiling(session);
      nextPageUrl = urlUtils.getUrlWithCompanyNumber(CREATE_TRANSACTION_PATH, companyNumber);
      //Sonarqube will flag a vulnerability if the URL produced by the line above is not validated on the next line.
      return redirectToUrl(nextPageUrl, res);
    }
    redirectToUrl(nextPageUrl, res);
  } catch (e) {
    return next(e);
  }
};

const createNewOfficerFiling = async (session: Session) => {
    const transactionId: string = "";
};

const companyHasNoDirectors = async (companyOfficers: CompanyOfficers): Promise<Boolean> => {

  let officers = companyOfficers.items
  let directorsList: Array<CompanyOfficer> = [];
  let ALLOWED_OFFICER_ROLES: string[] = ["director", "corporate-director", "nominee-director", "corporate-nominee-director"];

  console.log("ANONA: CO items = " + companyOfficers.items)
  console.log("ANONA: CO items Length = " + companyOfficers.items.length)

  for (var officer of officers){
    if (officer != null) {
      if (officer.officerRole != null) {
        if (ALLOWED_OFFICER_ROLES.some(x => x === officer.officerRole) && officer.resignedOn == null) {
            directorsList.push(officer);
        }
      }
    }
  }
  
  console.log("ANONA: directorsList length = " + directorsList.length)

  if (directorsList.length == 0){
    return true;
  } else {
    return false;
  }
};
