import { Request, Response, Router } from "express";
import * as startRoute from "../controllers/start.controller";
import * as signoutRoute from "../controllers/signout.controller";
import * as companyNumberRoute from "../controllers/company.number.controller";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
import * as createTransactionRoute from "../controllers/create.transaction.controller";
import * as activeDirectors from "../controllers/active.directors.controller";
import * as removeDirector from "../controllers/remove.director.controller";
import * as stopPathRoute from "../controllers/stop.screen.controller";
import * as removeDirectorCheckAnswers from "../controllers/remove.director.check.answers.controller";
import * as removeDirectorSubmitted from "../controllers/remove.director.submitted.controller";
import * as urls from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { logger } from "../utils/logger"


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

router.get(urls.ACTIVE_DIRECTORS, activeDirectors.get);
router.post(urls.ACTIVE_DIRECTORS, activeDirectors.post);

router.get(urls.REMOVE_DIRECTOR, removeDirector.get);
router.post(urls.REMOVE_DIRECTOR, removeDirector.post);

router.get(urls.REMOVE_DIRECTOR_CHECK_ANSWERS, removeDirectorCheckAnswers.get);
router.post(urls.REMOVE_DIRECTOR_CHECK_ANSWERS, removeDirectorCheckAnswers.post);

router.get(urls.REMOVE_DIRECTOR_SUBMITTED, removeDirectorSubmitted.get);

router.get(urls.SIGNOUT_PATH, signoutRoute.get);
router.post(urls.SIGNOUT_PATH, signoutRoute.post);

router.get(urls.SHOW_STOP_PAGE, stopPathRoute.get);
