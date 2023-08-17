import { Request, Response, Router } from "express";
import * as accessibilityStatementRoute from "../controllers/accessibility.statement.controller";
import * as activeDirectors from "../controllers/active.directors.controller";
import * as companyNumberRoute from "../controllers/company.number.controller";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as createTransactionRoute from "../controllers/create.transaction.controller";
import * as directorAppointedDate from "../controllers/director.appointed.date.controller";
import * as directorCorrespondeAddress from "../controllers/director.correspondence.address.controller";
import * as directorCorrespondeAddressSearch from "../controllers/director.correspondence.address.search.controller";
import * as directorCorrespondeAddressManual from "../controllers/director.correspondence.address.manual.controller";
import * as directorConfirmCorrespondeAddress from "../controllers/director.confirm.correspondence.address.controller";
import * as directorResidentialAddress from "../controllers/director.residential.address.controller";
import * as directorResidentialAddressSearch from "../controllers/director.residential.address.search.controller";
import * as directorResidentialAddressManual from "../controllers/director.residential.address.manual.controller";
import * as directorDateOfBirth from "../controllers/director.date.of.birth.controller";
import * as directorName from "../controllers/director.name.controller";
import * as directorNationality from "../controllers/director.nationality.controller";
import * as directorOccupation from "../controllers/director.occupation.controller";
import * as removeDirectorCheckAnswers from "../controllers/remove.director.check.answers.controller";
import * as removeDirector from "../controllers/remove.director.controller";
import * as removeDirectorSubmitted from "../controllers/remove.director.submitted.controller";
import * as signoutRoute from "../controllers/signout.controller";
import * as startRoute from "../controllers/start.controller";
import * as stopPathRoute from "../controllers/stop.screen.controller";
import { isFeatureEnabled } from "../middleware/is.feature.enabled.middleware";
import * as urls from "../types/page.urls";
import { AP01_ACTIVE } from "../utils/properties";


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
router.get(urls.DIRECTOR_NAME, isFeatureEnabled(AP01_ACTIVE), directorName.get);
router.post(urls.DIRECTOR_NAME, directorName.post);

router.get(urls.DIRECTOR_DATE_OF_BIRTH, isFeatureEnabled(AP01_ACTIVE), directorDateOfBirth.get);
router.post(urls.DIRECTOR_DATE_OF_BIRTH, directorDateOfBirth.post);

router.get(urls.DIRECTOR_APPOINTED_DATE, isFeatureEnabled(AP01_ACTIVE), directorAppointedDate.get);
router.post(urls.DIRECTOR_APPOINTED_DATE, directorAppointedDate.post);

router.get(urls.DIRECTOR_NATIONALITY, isFeatureEnabled(AP01_ACTIVE), directorNationality.get);
router.post(urls.DIRECTOR_NATIONALITY, directorNationality.post);

router.get(urls.DIRECTOR_OCCUPATION, isFeatureEnabled(AP01_ACTIVE), directorOccupation.get);
router.post(urls.DIRECTOR_OCCUPATION, directorOccupation.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), directorCorrespondeAddress.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS, directorCorrespondeAddress.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, isFeatureEnabled(AP01_ACTIVE), directorCorrespondeAddressSearch.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH, directorCorrespondeAddressSearch.post);

router.get(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, isFeatureEnabled(AP01_ACTIVE), directorCorrespondeAddressManual.get);
router.post(urls.DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL, directorCorrespondeAddressManual.post);

router.get(urls.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, isFeatureEnabled(AP01_ACTIVE), directorConfirmCorrespondeAddress.get);
router.post(urls.DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS, directorConfirmCorrespondeAddress.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS, isFeatureEnabled(AP01_ACTIVE), directorResidentialAddress.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS, directorResidentialAddress.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, isFeatureEnabled(AP01_ACTIVE), directorResidentialAddressSearch.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH, directorResidentialAddressSearch.post);

router.get(urls.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, isFeatureEnabled(AP01_ACTIVE), directorResidentialAddressManual.get);
router.post(urls.DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL, directorResidentialAddressManual.post);
