import { NextFunction, Request, Response } from "express";
import {urlUtils} from "../utils/url";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {getCompanyProfile} from "../services/company.profile.service";
import {Session} from "@companieshouse/node-session-handler";
import {getCurrentOrFutureDissolved} from "../services/stop.page.validation.service";
import {STOP_TYPE, allowedCompanyTypes} from "../utils/constants";
import { CompanyOfficer } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { getListActiveDirectorDetails } from "services/active.directors.details.service";
import { BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM } from "types/page.urls";
import { MetricsApi } from "@companieshouse/api-sdk-node/dist/services/company-metrics/types";
import { getCompanyMetrics } from "services/company.metrics.service";
import { getStop } from "controllers/stop.screen.controller";

/**
 * Changes for option #1 -
 * @param req
 * @param res
 * @param next
 */

export const hasValidCompanyForStopPage = async (req: Request, res: Response, next: NextFunction) => {
	try {

		const session: Session = req.session as Session;
		const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
		const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
		const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);
		const directorDtoList: CompanyOfficer[] = await getListActiveDirectorDetails(session, transactionId);


		if (directorDtoList.length === 0) {
			var stopPageRedirectUrl = urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req);
			stopPageRedirectUrl = urlUtils.setQueryParam(stopPageRedirectUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.NO_DIRECTORS);
			return res.redirect(stopPageRedirectUrl);
		}

		if (await getCurrentOrFutureDissolved(session, companyNumber)){
			var stopPageRedirectUrl = urlUtils.getUrlToPath(BASIC_STOP_PAGE_PATH, req);
			stopPageRedirectUrl = urlUtils.setQueryParam(stopPageRedirectUrl, URL_QUERY_PARAM.PARAM_STOP_TYPE, STOP_TYPE.DISSOLVED);
			return res.redirect(stopPageRedirectUrl);
		}

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


		// skipping no directors as that is going to be changed under https://companieshouse.atlassian.net/browse/DACT-569
		/**
		 * needs further work to implement following cases.
		 *   PRE_OCTOBER_2009 = "pre-october-2009",
		 *   ETAG = "etag",
		 *   SOMETHING_WENT_WRONG = "something-went-wrong"
		 */
		return getStop(req, res, next);
	} catch(e) {
		return next(e);
	}
}

const companyHasNoDirectors = async (companyNumber: string) => {
  const companyMetrics: MetricsApi = await getCompanyMetrics(companyNumber);
  return companyMetrics?.counts?.appointments?.activeDirectorsCount == 0;
}