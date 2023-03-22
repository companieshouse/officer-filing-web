import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import { router } from "./routes/routes";
import * as urls from "./types/page.urls";
import pageNotFound from "./controllers/error.controller";
import { authenticationMiddleware } from "./middleware/authentication.middleware";
import { sessionMiddleware } from "./middleware/session.middleware";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger";
import { companyAuthenticationMiddleware } from "./middleware/company.authentication.middleware";
import { commonTemplateVariablesMiddleware } from "./middleware/common.variables.middleware";

const app = express();
app.disable("x-powered-by");

// view engine setup
const nunjucksEnv = nunjucks.configure([
  "views",
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components/",
], {
  autoescape: true,
  express: app,
});

nunjucksEnv.addGlobal("assetPath", process.env.CDN_HOST);
nunjucksEnv.addGlobal("PIWIK_URL", process.env.PIWIK_URL);
nunjucksEnv.addGlobal("PIWIK_SITE_ID", process.env.PIWIK_SITE_ID);

app.enable("trust proxy");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// apply middleware
app.use(cookieParser());
//app.use(serviceAvailabilityMiddleware);


app.use(`${urls.OFFICER_FILING}*`, sessionMiddleware);


// ------------- Enable login redirect -----------------
const userAuthRegex = new RegExp("^" + urls.OFFICER_FILING + "/.+");
app.use(userAuthRegex, authenticationMiddleware);
app.use(`${urls.OFFICER_FILING}${urls.COMPANY_AUTH_PROTECTED_BASE}`, companyAuthenticationMiddleware);


app.use(commonTemplateVariablesMiddleware)
// apply our default router to /officer-filing
app.use(urls.OFFICER_FILING, router);
app.use(pageNotFound);

logger.info("Officer filing Web has started");
export default app;
