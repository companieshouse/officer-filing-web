import { NextFunction, Request, Response } from "express";
import {urlUtils} from "../utils/url";
import {CompanyProfile} from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import {getCompanyProfile} from "../services/company.profile.service";
import {Session} from "@companieshouse/node-session-handler";
import {getCurrentOrFutureDissolved} from "../services/stop.page.validation.service";
import {allowedCompanyTypes} from "../utils/constants";

/**
 * Changes for option #1 -
 * @param req
 * @param res
 * @param next
 */

export const hasValidCompanyForStopPage = async (req: Request, res: Response, next: NextFunction) => {
	const session: Session = req.session as Session;
	const companyNumber = urlUtils.getCompanyNumberFromRequestParams(req);
	const companyProfile: CompanyProfile = await getCompanyProfile(companyNumber);

	if (await getCurrentOrFutureDissolved(session, companyNumber)){
		return true;
	}
	if(allowedCompanyTypes.includes(companyProfile.type)) {
		return true;
	}
	// skipping no directors as that is going to be changed under https://companieshouse.atlassian.net/browse/DACT-569
	/**
	 * needs further work to implement following cases.
	 *   PRE_OCTOBER_2009 = "pre-october-2009",
	 *   ETAG = "etag",
	 *   SOMETHING_WENT_WRONG = "something-went-wrong"
	 */
	return false;
}