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
import { hasValidCompanyForStopPage } from "middleware/company.type.middleware";
import { companyAuthenticationMiddleware } from "middleware/company.authentication.middleware";


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

router.get(urls.CONFIRM_COMPANY, confirmCompanyRoute.get);
router.post(urls.CONFIRM_COMPANY, confirmCompanyRoute.post);

router.get(urls.CREATE_TRANSACTION, createTransactionRoute.get);

router.get(urls.CURRENT_DIRECTORS, activeDirectors.get);
router.post(urls.CURRENT_DIRECTORS, activeDirectors.post);

router.get(urls.SIGNOUT_PATH, signoutRoute.get);
router.post(urls.SIGNOUT_PATH, signoutRoute.post);

router.get(urls.BASIC_STOP_PAGE, stopPathRoute.getStop);
router.get(urls.APPID_STOP_PAGE, stopPathRoute.getStop);

// TM01
router.get(urls.DATE_DIRECTOR_REMOVED, removeDirector.get);
router.post(urls.DATE_DIRECTOR_REMOVED, removeDirector.post);

router.get(urls.REMOVE_DIRECTOR_CHECK_ANSWERS, removeDirectorCheckAnswers.get);
router.post(urls.REMOVE_DIRECTOR_CHECK_ANSWERS, removeDirectorCheckAnswers.post);

router.get(urls.REMOVE_DIRECTOR_SUBMITTED, removeDirectorSubmitted.get);

router.get(urls.ACCESSIBILITY_STATEMENT, accessibilityStatementRoute.get);
// AP01
router.get(urls.DIRECTOR_NAME, isFeatureEnabled(AP01_ACTIVE), checkYourAnswersMiddleware(), directorName.get);
router.post(urls.DIRECTOR_NAME, nameValidator, directorName.post);

router.get(urls.DIRECTOR_DATE_DETAILS, isFeatureEnabled(AP01_ACTIVE), checkYourAnswersMiddleware(), directorDateDetails.get);
router.post(urls.DIRECTOR_DATE_DETAILS, directorDateDetails.post);

router.get(urls.DIRECTOR_NATIONALITY, isFeatureEnabled(AP01_ACTIVE), checkYourAnswersMiddleware(), directorNationality.get);
router.post(urls.DIRECTOR_NATIONALITY, nationalityValidator, directorNationality.post);

router.get(urls.DIRECTOR_OCCUPATION, isFeatureEnabled(AP01_ACTIVE), checkYourAnswersMiddleware(), directorOccupation.get);
router.post(urls.DIRECTOR_OCCUPATION, directorOccupation.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), checkYourAnswersMiddleware(), directorCorrespondenceAddress.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS, directorCorrespondenceAddress.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, isFeatureEnabled(AP01_ACTIVE), directorCorrespondenceAddressSearch.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, directorCorrespondenceAddressSearch.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), directorCorrespondenceAddressChooseAddress.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS, directorCorrespondenceAddressChooseAddress.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, isFeatureEnabled(AP01_ACTIVE), directorCorrespondenceAddressManual.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, directorCorrespondenceAddressManual.post);

router.get(urls.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), directorConfirmCorrespondenceAddress.get);
router.post(urls.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, directorConfirmCorrespondenceAddress.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, directorCorrespondenceAddressLink.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, directorCorrespondenceAddressLink.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS, isFeatureEnabled(AP01_ACTIVE), directorResidentialAddress.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS, directorResidentialAddress.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, isFeatureEnabled(AP01_ACTIVE), directorResidentialAddressSearch.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, directorResidentialAddressSearch.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), directorResidentialAddressSearchChooseAddress.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS, directorResidentialAddressSearchChooseAddress.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, isFeatureEnabled(AP01_ACTIVE), directorResidentialAddressManual.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, directorResidentialAddressManual.post);

router.get(urls.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, isFeatureEnabled(AP01_ACTIVE), directorConfirmResidentialAddress.get);
router.post(urls.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, directorConfirmResidentialAddress.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_LINK, directorResidentialAddressLink.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_LINK, directorResidentialAddressLink.post);

router.get(urls.DIRECTOR_PROTECTED_DETAILS, isFeatureEnabled(AP01_ACTIVE), checkYourAnswersMiddleware(), directorProtectedDetails.get);
router.post(urls.DIRECTOR_PROTECTED_DETAILS, directorProtectedDetails.post);

router.get(urls.APPOINT_DIRECTOR_CHECK_ANSWERS, isFeatureEnabled(AP01_ACTIVE), appointDirectorCheckAnswers.get);
router.post(urls.APPOINT_DIRECTOR_CHECK_ANSWERS, appointDirectorCheckAnswers.post);

router.route(urls.APPOINT_DIRECTOR_SUBMITTED)
.all(
  isFeatureEnabled(AP01_ACTIVE),
  hasValidCompanyForStopPage, 
  companyAuthenticationMiddleware
)
.get(appointDirectorSubmitted.get)

// CH01
router.route(urls.UPDATE_DIRECTOR_DETAILS).all()
.get(updateDirectorDetail.get)
.post(updateDirectorDetail.post);