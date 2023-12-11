import { Request, Response, Router } from "express";
import * as accessibilityStatementRoute from "../controllers/accessibility.statement.controller";
import * as activeDirectors from "../controllers/active.directors.controller";
import * as appointDirectorCheckAnswers from "../controllers/appoint.director.check.answers.controller";
import * as appointDirectorSubmitted from "../controllers/appoint.director.submitted.controller";
import * as companyNumberRoute from "../controllers/company.number.controller";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as createTransactionRoute from "../controllers/create.transaction.controller";
import * as directorDateDetails from "../controllers/director.date.details.controller";
import * as directorCorrespondenceAddress from "../controllers/director.correspondence.address.controller";
import * as directorCorrespondenceAddressLink from "../controllers/director.correspondence.address.link.controller";
import * as directorCorrespondenceAddressSearch from "../controllers/director.correspondence.address.search.controller";
import * as directorCorrespondenceAddressChooseAddress from "../controllers/director.correspondence.address.search.choose.address.controller";
import * as directorCorrespondenceAddressManual from "../controllers/director.correspondence.address.manual.controller";
import * as directorConfirmCorrespondenceAddress from "../controllers/director.confirm.correspondence.address.controller";
import * as directorConfirmResidentialAddress from "../controllers/director.confirm.residential.address.controller";
import * as directorProtectedDetails from "../controllers/director.protected.details.controller";
import * as directorResidentialAddress from "../controllers/director.residential.address.controller";
import * as directorResidentialAddressLink from "../controllers/director.residential.address.link.controller";
import * as directorResidentialAddressSearch from "../controllers/director.residential.address.search.controller";
import * as directorResidentialAddressSearchChooseAddress from "../controllers/director.residential.address.search.choose.address.controller";
import * as directorResidentialAddressManual from "../controllers/director.residential.address.manual.controller";
import * as directorName from "../controllers/director.name.controller";
import * as directorNationality from "../controllers/director.nationality.controller";
import * as directorOccupation from "../controllers/director.occupation.controller";
import * as removeDirectorCheckAnswers from "../controllers/remove.director.check.answers.controller";
import * as removeDirector from "../controllers/remove.director.controller";
import * as removeDirectorSubmitted from "../controllers/remove.director.submitted.controller";
import * as signoutRoute from "../controllers/signout.controller";
import * as startRoute from "../controllers/start.controller";
import * as stopPathRoute from "../controllers/stop.screen.controller";
import * as updateDirectorDetail from "../controllers/update/update.director.details.controller";
import { isFeatureEnabled } from "../middleware/is.feature.enabled.middleware";
import * as urls from "../types/page.urls";
import { AP01_ACTIVE } from "../utils/properties";
import { checkYourAnswersMiddleware } from "../middleware/check.your.answers.middleware";
import { nameValidator } from "../validation/name.validation";
import { nationalityValidator } from "../validation/nationality.validation";
import { companyAuthenticationMiddleware } from "../middleware/company.authentication.middleware";

export const router: Router = Router();

/**
 * Simply renders a view template.
 *
 * @param template the template name
 */
const renderTemplate = (template: string) => (req: Request, res: Response) => {
  return res.render(template);
};

router.get("/", startRoute.get);

router.get(urls.COMPANY_NUMBER, companyNumberRoute.get);

router.route(urls.CONFIRM_COMPANY)
.all(companyAuthenticationMiddleware)
.get(confirmCompanyRoute.get)
.post(confirmCompanyRoute.post);

router.get(urls.CREATE_TRANSACTION, companyAuthenticationMiddleware, createTransactionRoute.get);

router.route(urls.CURRENT_DIRECTORS)
.all(companyAuthenticationMiddleware)
.get(activeDirectors.get)
.post(activeDirectors.post);

router.get(urls.SIGNOUT_PATH, signoutRoute.get);
router.post(urls.SIGNOUT_PATH, signoutRoute.post);

router.get(urls.BASIC_STOP_PAGE, stopPathRoute.get);
router.get(urls.APPID_STOP_PAGE, stopPathRoute.get);

// TM01
router.get(urls.DATE_DIRECTOR_REMOVED, removeDirector.get);
router.post(urls.DATE_DIRECTOR_REMOVED, removeDirector.post);

router.get(urls.REMOVE_DIRECTOR_CHECK_ANSWERS, removeDirectorCheckAnswers.get);
router.post(urls.REMOVE_DIRECTOR_CHECK_ANSWERS, removeDirectorCheckAnswers.post);

router.get(urls.REMOVE_DIRECTOR_SUBMITTED, removeDirectorSubmitted.get);

router.get(urls.ACCESSIBILITY_STATEMENT, accessibilityStatementRoute.get);
// AP01
router.route(urls.DIRECTOR_NAME)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware())
.get(directorName.get)
.post(nameValidator, directorName.post);

router.route(urls.DIRECTOR_DATE_DETAILS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware())
.get(directorDateDetails.get)
.post(directorDateDetails.post);

router.route(urls.DIRECTOR_NATIONALITY)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware())
.get(directorNationality.get)
.post(nationalityValidator, directorNationality.post);

router.route(urls.DIRECTOR_OCCUPATION)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware())
.get(directorOccupation.get)
.post(directorOccupation.post);

router.route(urls.DIRECTOR_CORRESPONDENCE_ADDRESS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware())
.get(directorCorrespondenceAddress.get)
.post(directorCorrespondenceAddress.post);

router.route(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorCorrespondenceAddressSearch.get)
.post(directorCorrespondenceAddressSearch.post);

router.route(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorCorrespondenceAddressChooseAddress.get)
.post(directorCorrespondenceAddressChooseAddress.post);

router.route(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorCorrespondenceAddressManual.get)
.post(directorCorrespondenceAddressManual.post);

router.route(urls.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorConfirmCorrespondenceAddress.get)
.post(directorConfirmCorrespondenceAddress.post);

router.route(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorCorrespondenceAddressLink.get)
.post(directorCorrespondenceAddressLink.post);

router.route(urls.DIRECTOR_RESIDENTIAL_ADDRESS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorResidentialAddress.get)
.post(directorResidentialAddress.post);

router.route(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorResidentialAddressSearch.get)
.post(directorResidentialAddressSearch.post);

router.route(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorResidentialAddressSearchChooseAddress.get)
.post(directorResidentialAddressSearchChooseAddress.post);

router.route(urls.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorResidentialAddressManual.get)
.post(directorResidentialAddressManual.post);

router.route(urls.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorConfirmResidentialAddress.get)
.post(directorConfirmResidentialAddress.post);

router.route(urls.DIRECTOR_RESIDENTIAL_ADDRESS_LINK)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(directorResidentialAddressLink.get)
.post(directorResidentialAddressLink.post);

router.route(urls.DIRECTOR_PROTECTED_DETAILS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware())
.get(directorProtectedDetails.get)
.post(directorProtectedDetails.post);

router.route(urls.APPOINT_DIRECTOR_CHECK_ANSWERS)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(appointDirectorCheckAnswers.get)
.post(appointDirectorCheckAnswers.post);

router.route(urls.APPOINT_DIRECTOR_SUBMITTED)
.all(isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware)
.get(appointDirectorSubmitted.get);

// CH01
router.route(urls.UPDATE_DIRECTOR_DETAILS).all(companyAuthenticationMiddleware)
.get(updateDirectorDetail.get)
.post(updateDirectorDetail.post);
