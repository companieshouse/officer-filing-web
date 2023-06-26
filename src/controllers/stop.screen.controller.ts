import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlParams } from "../types/page.urls";

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import { COMPANY_NAME_PLACEHOLDER, STOP_TYPE, STOP_PAGE_CONTENT } from "../utils/constants";
import { urlUtils } from "../utils/url";

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
    // Some of these query parameters are not guaranteed - multiple url paths are possible
    const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const appointmentId = urlUtils.getAppointmentIdFromRequestParams(req);

    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    var companyName = companyProfile.companyName;
    if (companyName === "") {
        if(stopType === STOP_TYPE.DISSOLVED || stopType === STOP_TYPE.NO_DIRECTORS){
            // Company name is at the start of the paragraph.
            companyName = "This company";
        } else {
            companyName = "this company";
        }
    }

    switch(stopType) { 
        case STOP_TYPE.DISSOLVED: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.dissolved.pageHeader,
                pageBody: STOP_PAGE_CONTENT.dissolved.pageBody.replace(new RegExp(COMPANY_NAME_PLACEHOLDER, 'g'), companyName)
            }
        }
        case STOP_TYPE.NO_DIRECTORS: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.noDirectors.pageHeader,
                pageBody: STOP_PAGE_CONTENT.noDirectors.pageBody.replace(new RegExp(COMPANY_NAME_PLACEHOLDER, 'g'), companyName)
            }
        }
        case STOP_TYPE.LIMITED_UNLIMITED: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.limitedUnlimited.pageHeader,
                pageBody: STOP_PAGE_CONTENT.limitedUnlimited.pageBody.replace(new RegExp(COMPANY_NAME_PLACEHOLDER, 'g'), companyName)
            }
        }
        case STOP_TYPE.PRE_OCTOBER_2009: {
            return {
                pageHeader: STOP_PAGE_CONTENT.pre_october_2009.pageHeader,
                pageBody: STOP_PAGE_CONTENT.pre_october_2009.pageBody
                    .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber)
                    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, transactionId)
                    .replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, appointmentId)
            }
        }
        case STOP_TYPE.ETAG: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.etag.pageHeader,
                pageBody: STOP_PAGE_CONTENT.etag.pageBody
            }
        }
        default: { 
           throw Error("Unrecognised stop screen type: " + stopType); 
        } 
     } 
}
