import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { URL_QUERY_PARAM } from "../types/page.urls";

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { COMPANY_NAME_PLACEHOLDER, STOP_TYPE, STOP_PAGE_CONTENT } from "../utils/constants";

export const get = async (req, res, next: NextFunction) => {
    try {
        const stopType = req.query.stopType as string;
        const content = setContent(req, stopType);
        return displayStopPage(res, await content);
    } catch (e) {
        return next(e);
    }
}

const displayStopPage = (res: Response, content: {pageHeader: string, pageBody: string}) => {
    return res.render(Templates.STOP_PAGE, content);
};

const setContent = async (req: Request, stopType: string) => {  
    const companyNumber = req.query[URL_QUERY_PARAM.COMPANY_NUM] as string;
    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

    if (companyProfile.companyName === "") {
        if(stopType === STOP_TYPE.DISSOLVED || stopType === STOP_TYPE.NO_DIRECTORS){
            // Company name is at the start of the paragraph.
            companyProfile.companyName = "This company";
        } 
        else{
            companyProfile.companyName = "this company";
        }
    }

    switch(stopType) { 
        case STOP_TYPE.DISSOLVED: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.dissolved.pageHeader,
                pageBody: STOP_PAGE_CONTENT.dissolved.pageBody.replace(new RegExp(COMPANY_NAME_PLACEHOLDER, 'g'), companyProfile.companyName)
            }
        }
        case STOP_TYPE.NO_DIRECTORS: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.noDirectors.pageHeader,
                pageBody: STOP_PAGE_CONTENT.noDirectors.pageBody.replace(new RegExp(COMPANY_NAME_PLACEHOLDER, 'g'), companyProfile.companyName)
            }
        }
        case STOP_TYPE.LIMITED_UNLIMITED: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.limitedUnlimited.pageHeader,
                pageBody: STOP_PAGE_CONTENT.limitedUnlimited.pageBody.replace(new RegExp(COMPANY_NAME_PLACEHOLDER, 'g'), companyProfile.companyName)
            }
        } 
        default: { 
           throw Error("Unrecognised stop screen type: " + stopType); 
        } 
     } 
}
