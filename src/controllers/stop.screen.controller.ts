import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { BASIC_STOP_PAGE_PATH, DATE_DIRECTOR_REMOVED_PATH, URL_QUERY_PARAM, urlParams } from "../types/page.urls";

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
    STOP_PAGE_BODY_CONTACT_US_LINK,
    STOP_PAGE_CONTACT_US_TEXT,
    PRE_OCTOBER_2009_HEADER,
    PRE_OCTOBER_2009_HEADER1,
    PRE_OCTOBER_2009_288B_LINK_TEXT1,
    PRE_OCTOBER_2009_288B_LINK_TEXT2,
    PRE_OCTOBER_2009_288B_PARAGRAPH_TEXT,
    PRE_OCTOBER_2009_REMOVED_DATE_TEXT1,
    PRE_OCTOBER_2009_REMOVED_DATE_TEXT2,
    PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT1,
    PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT2,
    DATE_DIRECTOR_REMOVED_LINK,
    SECURE_OFFICER_HEADER,
    SECURE_OFFICER_BODY_1,
    SECURE_OFFICER_BODY_2
} from "../utils/constants";
import { urlUtils } from "../utils/url";
import { addLangToUrl, getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

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
    const currentBaseUrl = urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req);

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
            const DATE_REMOVED_URL = DATE_DIRECTOR_REMOVED_PATH
                .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber)
                .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, transactionId)
                .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, submissionId);
            return {
                ...localeInfo,
                currentUrl: urlUtils.setQueryParam(currentBaseUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.PRE_OCTOBER_2009),
                pageHeader: STOP_PAGE_CONTENT.pre_october_2009.pageHeader.replace(new RegExp(PRE_OCTOBER_2009_HEADER, 'g'), localeInfo.i18n.stopPagePre2009CannotUseText),
                pageBody: STOP_PAGE_CONTENT.pre_october_2009.pageBody
                    .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, companyNumber)
                    .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, transactionId)
                    .replace(`:${urlParams.PARAM_APPOINTMENT_ID}`, appointmentId)
                    .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, submissionId)
                    .replace(new RegExp(DATE_DIRECTOR_REMOVED_LINK, 'g'), addLangToUrl(DATE_REMOVED_URL, lang))
                    .replace(new RegExp(PRE_OCTOBER_2009_HEADER1, 'g'), localeInfo.i18n.stopPagePre2009Header1)
                    .replace(new RegExp(PRE_OCTOBER_2009_288B_LINK_TEXT1, 'g'), localeInfo.i18n.stopPagePre2009Form288bLinkText1)
                    .replace(new RegExp(PRE_OCTOBER_2009_288B_LINK_TEXT2, 'g'), localeInfo.i18n.stopPagePre2009Form288bLinkText2)
                    .replace(new RegExp(PRE_OCTOBER_2009_288B_PARAGRAPH_TEXT, 'g'), localeInfo.i18n.stopPagePre2009Form288bParagraphText)
                    .replace(new RegExp(PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT1, 'g'), localeInfo.i18n.stopPagePre2009WhereToContactUsText1)
                    .replace(new RegExp(PRE_OCTOBER_2009_WHERE_TO_CONTACT_TEXT2, 'g'), localeInfo.i18n.stopPagePre2009WhereToContactUsText2)
                    .replace(new RegExp(PRE_OCTOBER_2009_REMOVED_DATE_TEXT1, 'g'), localeInfo.i18n.stopPagePre2009RemovedDateText1)
                    .replace(new RegExp(PRE_OCTOBER_2009_REMOVED_DATE_TEXT2, 'g'), localeInfo.i18n.stopPagePre2009RemovedDateText2)
                    .replace(new RegExp(STOP_PAGE_BODY_CONTACT_US_LINK, 'g'), localeInfo.i18n.stopPageContactUsLink)
                    .replace(new RegExp(STOP_PAGE_CONTACT_US_TEXT, 'g'), localeInfo.i18n.stopPageContactUsText)
            }
        }
        case STOP_TYPE.ETAG: { 
            return {
                ...localeInfo,
                currentUrl: urlUtils.setQueryParam(currentBaseUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.ETAG),
                pageHeader: STOP_PAGE_CONTENT.etag.pageHeader.replace(new RegExp(ETAG_PAGE_HEADER, 'g'), localeInfo.i18n.stopPageEtagPageHeader),
                pageBody: STOP_PAGE_CONTENT.etag.pageBody
                    .replace(new RegExp(ETAG_PAGE_BODY_1, 'g'), localeInfo.i18n.stopPageEtagPageBody1)
                    .replace(new RegExp(ETAG_PAGE_BODY_2, 'g'), localeInfo.i18n.stopPageEtagPageBody2)
                    .replace(new RegExp(ETAG_PAGE_BODY_START_SERVICE_AGAIN_LINK, 'g'), localeInfo.i18n.stopPageEtagStartServiceAgainLink)
                    .replace(new RegExp(STOP_PAGE_BODY_CONTACT_US_LINK, 'g'), localeInfo.i18n.stopPageContactUsLink)
                    .replace(new RegExp(STOP_PAGE_CONTACT_US_TEXT, 'g'), localeInfo.i18n.stopPageContactUsText),
            }
        }
        case STOP_TYPE.SOMETHING_WENT_WRONG: { 
            return {
                pageHeader: STOP_PAGE_CONTENT.somethingWentWrong.pageHeader,
                pageBody: STOP_PAGE_CONTENT.somethingWentWrong.pageBody
            }
        }
        case STOP_TYPE.SECURE_OFFICER:  {
            return {
                ...localeInfo,
                currentUrl: urlUtils.setQueryParam(currentBaseUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.SECURE_OFFICER),
                pageHeader: STOP_PAGE_CONTENT.secure_officer.pageHeader.replace(new RegExp(SECURE_OFFICER_HEADER, 'g'), localeInfo.i18n.stopPageSecureOfficerPageHeader),
                pageBody: STOP_PAGE_CONTENT.secure_officer.pageBody
                    .replace(new RegExp(SECURE_OFFICER_BODY_1, 'g'), localeInfo.i18n.stopPageSecureOfficerBody1)
                    .replace(new RegExp(SECURE_OFFICER_BODY_2, 'g'), localeInfo.i18n.stopPageSecureOfficerBody2)
                    .replace(new RegExp(SECURE_OFFICER_BODY_2, 'g'), localeInfo.i18n.stopPageSecureOfficerBody2Link2)
            }
        }
        default: { 
           throw Error("Unrecognised stop screen type: " + stopType); 
        } 
     } 
}
