import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { urlParams } from "../types/page.urls";

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/company.profile.service";
import {
    COMPANY_NAME_PLACEHOLDER,
    STOP_TYPE,
    STOP_PAGE_CONTENT,
    ETAG_PAGE_HEADER,
    ETAG_PAGE_BODY_1,
    ETAG_PAGE_BODY_2,
    ETAG_PAGE_BODY_START_SERVICE_AGAIN_LINK,
    ETAG_PAGE_BODY_CONTACT_US_LINK,
    ETAG_PAGE_BODY_3
} from "../utils/constants";
import { urlUtils } from "../utils/url";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

export const get = async (req: Request, res: Response, next: NextFunction) => {
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
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const localeInfo = getLocaleInfo(locales, lang);

    const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
    var companyName = companyProfile.companyName;
    if (companyName === "") {
        if(stopType === STOP_TYPE.DISSOLVED){
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
                    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, submissionId)
            }
        }
        case STOP_TYPE.ETAG: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.etag.pageHeader.replace(new RegExp(ETAG_PAGE_HEADER, 'g'), localeInfo.i18n.stopPageEtagPageHeader),
                pageBody: STOP_PAGE_CONTENT.etag.pageBody
                    .replace(new RegExp(ETAG_PAGE_BODY_1, 'g'), localeInfo.i18n.stopPageEtagPageBody1)
                    .replace(new RegExp(ETAG_PAGE_BODY_2, 'g'), localeInfo.i18n.stopPageEtagPageBody2)
                    .replace(new RegExp(ETAG_PAGE_BODY_START_SERVICE_AGAIN_LINK, 'g'), localeInfo.i18n.stopPageEtagStartServiceAgainLink)
                    .replace(new RegExp(ETAG_PAGE_BODY_CONTACT_US_LINK, 'g'), localeInfo.i18n.stopPageEtagContactUsLink)
                    .replace(new RegExp(ETAG_PAGE_BODY_3, 'g'), localeInfo.i18n.stopPageEtagPageBody3)
            }
        }
        case STOP_TYPE.SOMETHING_WENT_WRONG: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.somethingWentWrong.pageHeader,
                pageBody: STOP_PAGE_CONTENT.somethingWentWrong.pageBody
            }
        }
        default: { 
           throw Error("Unrecognised stop screen type: " + stopType); 
        } 
     } 
}
