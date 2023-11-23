import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { BASIC_STOP_PAGE_PATH, COMPANY_LOOKUP, CREATE_TRANSACTION_PATH, URL_QUERY_PARAM, urlParams} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { getCompanyMetrics } from "../services/company.metrics.service";
import { buildAddress, formatForDisplay } from "../services/confirm.company.service";
import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { STOP_TYPE, allowedCompanyTypes } from "../utils/constants";
import { MetricsApi } from "@companieshouse/api-sdk-node/dist/services/company-metrics/types";
import { LocalesService, LanguageNames } from "@companieshouse/ch-node-utils"
import { logger } from "../utils/logger";

export const isValidUrl = (url: string) => { 
  return url.startsWith("/appoint-update-remove-company-officer")
};

export const redirectToUrl = (url: string, res: Response) => { 
  if(isValidUrl(url)) {
    return res.redirect(url);
  } else {
    throw Error("URL to redirect to (" + url + ") was not valid");
  }
};

const selectLang = (lang) => {
  switch(lang) {
    case "cy": return "cy";
    default: return "en";
  }
}

const getLocalesService = () => LocalesService.getInstance("locales", true);


export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    logger.debug("languageEnabled: " + locales.enabled + " for " + lang + " from " + locales.localesFolder);
    logger.debug("folder:" + locales.localesFolder);
    //logger.debug("Translations: " + JSON.stringify(locales.i18nCh.resolveNamespacesKeys(lang)));
    
    const session: Session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

    const pageOptions = await buildPageOptions(session, companyProfile, locales, lang);
    return res.render(Templates.CONFIRM_COMPANY, pageOptions);
    
  } catch (e) {
    return next(e);
  }
};

const buildPageOptions = async (session: Session, companyProfile: CompanyProfile, locales: LocalesService, lang: string): Promise<Object> => {
  companyProfile = formatForDisplay(companyProfile);
  var addressArray: string[] = [companyProfile.registeredOfficeAddress.poBox,
    companyProfile.registeredOfficeAddress.premises, companyProfile.registeredOfficeAddress.addressLineOne,
    companyProfile.registeredOfficeAddress.addressLineTwo, companyProfile.registeredOfficeAddress.locality,
    companyProfile.registeredOfficeAddress.region, companyProfile.registeredOfficeAddress.country,
    companyProfile.registeredOfficeAddress.postalCode]
  const address = buildAddress(addressArray);
  return {
    languageEnabled: locales.enabled,
    languages: LanguageNames.sourceLocales(locales.localesFolder),
    address: address,
    currentUrl: Templates.CONFIRM_COMPANY + "?companyNumber=" + companyProfile.companyNumber,
    i18n: locales.i18nCh.resolveNamespacesKeys(lang),
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

    var nextPageUrl = urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req);
    if (await getCurrentOrFutureDissolved(session, companyNumber)){
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED);
    }
    else if(!allowedCompanyTypes.includes(companyProfile.type)){
      nextPageUrl = urlUtils.setQueryParam(nextPageUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.LIMITED_UNLIMITED);
    }
    // get number of active directors - if none go straight to stop screen and do not create transaction
    else if(await companyHasNoDirectors(companyNumber)){
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

const companyHasNoDirectors = async (companyNumber: string) => {
  const companyMetrics: MetricsApi = await getCompanyMetrics(companyNumber);
  return companyMetrics?.counts?.appointments?.activeDirectorsCount == 0;
}

const createNewOfficerFiling = async (session: Session) => {
    const transactionId: string = "";
};
