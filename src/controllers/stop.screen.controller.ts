import { Handler, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { URL_QUERY_PARAM } from "../types/page.urls";

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";

export const get: Handler = async (req, res) => {
    const content = setContent(req)
    displayStopPage(res, await content)
}

const displayStopPage = (res: Response, content: { content: {pageHeader: string, pageBody: string}}) => {
    return res.render(Templates.STOP_PAGE, content);
};

const setContent = async (req: Request) => {  
    
    const companyNumber = req.query[URL_QUERY_PARAM.COMPANY_NUM] as string;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

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
