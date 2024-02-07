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
import * as directorCorrespondenceAddressEnterManuallyLink from "../controllers/director.link.correspondence.address.enter.manually";
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
import * as directorUpdateOccupation from "../controllers/update/update.director.occupation.controller";
import * as directorDateOfChange from "../controllers/update/director.date.of.change.controller";
import * as directorUpdateSubmitted from "../controllers/update/update.director.submitted.controller";
import * as removeDirectorCheckAnswers from "../controllers/remove.director.check.answers.controller";
import * as removeDirector from "../controllers/remove.director.controller";
import * as removeDirectorSubmitted from "../controllers/remove.director.submitted.controller";
import * as signoutRoute from "../controllers/signout.controller";
import * as startRoute from "../controllers/start.controller";
import * as stopPathRoute from "../controllers/stop.screen.controller";
import * as updateDirectorDetail from "../controllers/update/update.director.details.controller";
import * as updateDirectorCheckAnswers from "../controllers/update/update.director.check.answers.controller";
import * as updateDirectorName from "../controllers/update/update.director.name.controller";
import * as updateDirectorNationality from "../controllers/update/update.director.nationality.controller";
import * as updateCorrespondenceAddressChooseAddress from "../controllers/update/update.director.correspondence.address.choose.address.controller";
import * as directorCorrespondenceAddressSearchUpdate from "../controllers/update/update.director.correspondence.address.search.controller";
import { isFeatureEnabled } from "../middleware/is.feature.enabled.middleware";
import * as updateDirectorCorrespondenceAddress from "../controllers/update/update.director.correspondence.address.controller";
import * as updateDirectorCorrespondenceAddressLink from "../controllers/update/update.director.correspondence.address.link.controller";
import * as updateDirectorResidentialAddress from "../controllers/update/update.director.residential.address.controller";
import * as urls from "../types/page.urls";
import { AP01_ACTIVE, CH01_ACTIVE } from "../utils/properties";
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

router.get(urls.CONFIRM_COMPANY, confirmCompanyRoute.get);
router.post(urls.CONFIRM_COMPANY, confirmCompanyRoute.post);

router.get(urls.CREATE_TRANSACTION, companyAuthenticationMiddleware, createTransactionRoute.get);

router.get(urls.CURRENT_DIRECTORS, companyAuthenticationMiddleware, activeDirectors.get);
router.post(urls.CURRENT_DIRECTORS, companyAuthenticationMiddleware, activeDirectors.post);

router.get(urls.SIGNOUT_PATH, signoutRoute.get);
router.post(urls.SIGNOUT_PATH, signoutRoute.post);

router.get(urls.BASIC_STOP_PAGE, stopPathRoute.get);
router.get(urls.APPID_STOP_PAGE, stopPathRoute.get);

// TM01
router.get(urls.DATE_DIRECTOR_REMOVED, companyAuthenticationMiddleware, removeDirector.get);
router.post(urls.DATE_DIRECTOR_REMOVED, companyAuthenticationMiddleware, removeDirector.post);

router.get(urls.REMOVE_DIRECTOR_CHECK_ANSWERS, companyAuthenticationMiddleware, removeDirectorCheckAnswers.get);
router.post(urls.REMOVE_DIRECTOR_CHECK_ANSWERS, companyAuthenticationMiddleware, removeDirectorCheckAnswers.post);

router.get(urls.REMOVE_DIRECTOR_SUBMITTED, companyAuthenticationMiddleware, removeDirectorSubmitted.get);

router.get(urls.ACCESSIBILITY_STATEMENT, accessibilityStatementRoute.get);
// AP01
router.get(urls.DIRECTOR_NAME, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), directorName.get);
router.post(urls.DIRECTOR_NAME, companyAuthenticationMiddleware, nameValidator, directorName.post);

router.get(urls.DIRECTOR_DATE_DETAILS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), directorDateDetails.get);
router.post(urls.DIRECTOR_DATE_DETAILS, companyAuthenticationMiddleware, directorDateDetails.post);

router.get(urls.DIRECTOR_NATIONALITY, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), directorNationality.get);
router.post(urls.DIRECTOR_NATIONALITY, companyAuthenticationMiddleware, nationalityValidator, directorNationality.post);

router.get(urls.DIRECTOR_OCCUPATION, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), directorOccupation.get);
router.post(urls.DIRECTOR_OCCUPATION, companyAuthenticationMiddleware, directorOccupation.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), directorCorrespondenceAddress.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS, companyAuthenticationMiddleware, directorCorrespondenceAddress.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorCorrespondenceAddressSearch.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, companyAuthenticationMiddleware, directorCorrespondenceAddressSearch.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorCorrespondenceAddressChooseAddress.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS, companyAuthenticationMiddleware, directorCorrespondenceAddressChooseAddress.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorCorrespondenceAddressManual.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, companyAuthenticationMiddleware, directorCorrespondenceAddressManual.post);

router.get(urls.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorConfirmCorrespondenceAddress.get);
router.post(urls.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, companyAuthenticationMiddleware, directorConfirmCorrespondenceAddress.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, companyAuthenticationMiddleware, directorCorrespondenceAddressLink.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, companyAuthenticationMiddleware, directorCorrespondenceAddressLink.post);

router.get(urls.DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, companyAuthenticationMiddleware, directorCorrespondenceAddressEnterManuallyLink.get);
router.post(urls.DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY, companyAuthenticationMiddleware, directorCorrespondenceAddressEnterManuallyLink.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorResidentialAddress.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS, companyAuthenticationMiddleware, directorResidentialAddress.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorResidentialAddressSearch.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, companyAuthenticationMiddleware, directorResidentialAddressSearch.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorResidentialAddressSearchChooseAddress.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS, companyAuthenticationMiddleware, directorResidentialAddressSearchChooseAddress.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorResidentialAddressManual.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, companyAuthenticationMiddleware, directorResidentialAddressManual.post);

router.get(urls.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, directorConfirmResidentialAddress.get);
router.post(urls.DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS, companyAuthenticationMiddleware, directorConfirmResidentialAddress.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_LINK, companyAuthenticationMiddleware, directorResidentialAddressLink.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_LINK, companyAuthenticationMiddleware, directorResidentialAddressLink.post);

router.get(urls.DIRECTOR_PROTECTED_DETAILS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), directorProtectedDetails.get);
router.post(urls.DIRECTOR_PROTECTED_DETAILS, companyAuthenticationMiddleware, directorProtectedDetails.post);

router.get(urls.APPOINT_DIRECTOR_CHECK_ANSWERS, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, appointDirectorCheckAnswers.get);
router.post(urls.APPOINT_DIRECTOR_CHECK_ANSWERS, companyAuthenticationMiddleware, appointDirectorCheckAnswers.post);

router.get(urls.APPOINT_DIRECTOR_SUBMITTED, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, appointDirectorSubmitted.get);

// CH01
router.get(urls.UPDATE_DIRECTOR_DETAILS, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, updateDirectorDetail.get);
router.post(urls.UPDATE_DIRECTOR_DETAILS, companyAuthenticationMiddleware, updateDirectorDetail.post);

router.get(urls.UPDATE_DIRECTOR_CHECK_ANSWERS, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, updateDirectorCheckAnswers.get);
router.post(urls.UPDATE_DIRECTOR_CHECK_ANSWERS, companyAuthenticationMiddleware, updateDirectorCheckAnswers.post);

router.get(urls.UPDATE_DIRECTOR_NAME, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), updateDirectorName.get);
router.post(urls.UPDATE_DIRECTOR_NAME, companyAuthenticationMiddleware, nameValidator, updateDirectorName.post);

router.get(urls.DIRECTOR_DATE_OF_CHANGE, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), directorDateOfChange.get);
router.post(urls.DIRECTOR_DATE_OF_CHANGE, companyAuthenticationMiddleware, directorDateOfChange.post);


router.get(urls.UPDATE_DIRECTOR_OCCUPATION, isFeatureEnabled(AP01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), directorUpdateOccupation.get);
router.post(urls.UPDATE_DIRECTOR_OCCUPATION, companyAuthenticationMiddleware, directorUpdateOccupation.post);

router.get(urls.UPDATE_DIRECTOR_SUBMITTED, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, directorUpdateSubmitted.get);

router.get(urls.UPDATE_DIRECTOR_NATIONALITY, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), updateDirectorNationality.get);
router.post(urls.UPDATE_DIRECTOR_NATIONALITY, companyAuthenticationMiddleware, nationalityValidator, updateDirectorNationality.post);

router.get(urls.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), updateDirectorCorrespondenceAddress.get);
router.post(urls.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS, companyAuthenticationMiddleware, updateDirectorCorrespondenceAddress.post);

router.get(urls.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, companyAuthenticationMiddleware, updateDirectorCorrespondenceAddressLink.get);
router.post(urls.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK, companyAuthenticationMiddleware, updateDirectorCorrespondenceAddressLink.post);

router.get(urls.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, directorCorrespondenceAddressSearchUpdate.get);
router.post(urls.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, companyAuthenticationMiddleware, directorCorrespondenceAddressSearchUpdate.post);

router.get(urls.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, updateCorrespondenceAddressChooseAddress.get);
router.post(urls.UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS, companyAuthenticationMiddleware, updateCorrespondenceAddressChooseAddress.post);

router.get(urls.UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS, isFeatureEnabled(CH01_ACTIVE), companyAuthenticationMiddleware, checkYourAnswersMiddleware(), updateDirectorResidentialAddress.get);
router.post(urls.UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS, companyAuthenticationMiddleware, updateDirectorResidentialAddress.post);
