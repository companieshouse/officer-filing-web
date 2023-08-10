import { Request, Response, Router } from "express";
import * as activeDirectors from "../controllers/active.directors.controller";
import * as companyNumberRoute from "../controllers/company.number.controller";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as createTransactionRoute from "../controllers/create.transaction.controller";
import * as directorAppointedDate from "../controllers/director.appointed.date.controller";
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

// AP01
router.get(urls.DIRECTOR_NAME, isFeatureEnabled(AP01_ACTIVE), directorName.get);
router.post(urls.DIRECTOR_NAME, directorName.post);

router.get(urls.DIRECTOR_DATE_OF_BIRTH, isFeatureEnabled(AP01_ACTIVE), directorDateOfBirth.get);
router.post(urls.DIRECTOR_DATE_OF_BIRTH, directorDateOfBirth.post);

router.get(urls.DIRECTOR_NATIONALITY, isFeatureEnabled(AP01_ACTIVE), directorNationality.get);
router.post(urls.DIRECTOR_NATIONALITY, directorNationality.post);

router.get(urls.DIRECTOR_OCCUPATION, isFeatureEnabled(AP01_ACTIVE), directorOccupation.get);
router.post(urls.DIRECTOR_OCCUPATION, directorOccupation.post);

router.get(urls.DIRECTOR_APPOINTED_DATE, isFeatureEnabled(AP01_ACTIVE), directorAppointedDate.get);
router.post(urls.DIRECTOR_APPOINTED_DATE, directorAppointedDate.post);
