import { Request, Response, Router } from "express";
import * as startRoute from "../controllers/start.controller";
import * as companyNumberRoute from "../controllers/company.number.controller";
import * as confirmCompanyRoute from "../controllers/confirm.company.controller";
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
