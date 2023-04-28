import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { COMPANY_LOOKUP, CREATE_TRANSACTION_PATH} from "../types/page.urls";
import { urlUtils } from "../utils/url";
import { getCompanyProfile } from "../services/company.profile.service";
import { buildAddress, formatForDisplay } from "../services/confirm.company.service";
import { currentOrFutureDissolved } from "../validators/stop.page.validator";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session: Session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

    const transactionId = "No transaction yet";
    // const oAuth = session.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];
    // if (oAuth) {
    //   return createApiClient(undefined, oAuth);
    // }

    if (await currentOrFutureDissolved(session, companyNumber)){
      const content = setContent(companyProfile)
      displayStopPage(res, content)
    }
    else {
      const pageOptions = await buildPageOptions(session, companyProfile);
      return res.render(Templates.CONFIRM_COMPANY, pageOptions);
    }

  } catch (e) {
    return next(e);
  }
};

const setContent = (companyProfile: CompanyProfile) => {
  if (companyProfile.companyName == undefined || companyProfile.companyName == "") {
    companyProfile.companyName = "This company"
  }
  
  const content = {
    pageHeader: "Company is Dissolved or it's in the process of being dissolved",
    pageBody: `
    <p>${companyProfile.companyName} cannot use this service because it has been dissolved, or it's in the process of being dissolved.</p>

    <p><a href="https://www.gov.uk/guidance/company-restoration-guide" data-event-id="read-the-company-restoration-guide-link">Read the Company Restoration Guide</a> to find out more about restoring a company name to the register.</p>
    <p>If this is the wrong company, <a href="/officer-filing-web" data-event-id="start-the-service-again-link">start the service again</a>.</p>
    <p><a href="https://www.gov.uk/contact-companies-house" data-event-id="contact-us-link">Contact us</a> if you have any questions.</p>
    `
  }

  return{
    content
  }
}

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

const displayStopPage = (res: Response, content: { content: {pageHeader: string, pageBody: string}}) => {
  return res.render(Templates.STOP_PAGE, content);
};
