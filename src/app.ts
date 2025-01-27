import express from "express";
import * as nunjucks from "nunjucks";
import * as path from "path";
import { router } from "./routes/routes";
import * as urls from "./types/page.urls";
import { pageNotFound, errorHandler } from "./controllers/error.controller";
import { serviceAvailabilityMiddleware } from "./middleware/service.availability.middleware";
import { authenticationMiddleware } from "./middleware/authentication.middleware";
import { createSessionMiddleware } from "./middleware/session.middleware";
import cookieParser from "cookie-parser";
import { logger } from "./utils/logger";
import { commonTemplateVariablesMiddleware } from "./middleware/common.variables.middleware";
import { AP01_ACTIVE, CACHE_SERVER, CH01_ACTIVE } from "./utils/properties";
import { SessionStore } from "@companieshouse/node-session-handler";
import { createCsrfProtectionMiddleware, csrfErrorHandler } from "./middleware/csrf.middleware";
import Redis from "ioredis";

const app = express();
app.disable("x-powered-by");

const redis = new Redis(CACHE_SERVER);
const sessionStore = new SessionStore(redis);
const sessionMiddleware = createSessionMiddleware(sessionStore);
const csrfProtectionMiddleware = createCsrfProtectionMiddleware(sessionStore);

// view engine setup
const nunjucksEnv = nunjucks.configure([
  "views",
  "node_modules/govuk-frontend/",
  "node_modules/govuk-frontend/components/",
  "node_modules/@companieshouse/ch-node-utils/templates/",
  "node_modules/@companieshouse/",
], {
  autoescape: true,
  express: app,
});

nunjucksEnv.addGlobal("assetPath", process.env.CDN_HOST);
nunjucksEnv.addGlobal("PIWIK_URL", process.env.PIWIK_URL);
nunjucksEnv.addGlobal("PIWIK_SITE_ID", process.env.PIWIK_SITE_ID);
nunjucksEnv.addGlobal("AP01_ACTIVE", AP01_ACTIVE);
nunjucksEnv.addGlobal("CH01_ACTIVE", CH01_ACTIVE);
nunjucksEnv.addGlobal('publicRegisterInformation', "What information we'll show on the public online register");

app.enable("trust proxy");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// apply middleware
app.use(cookieParser());
app.use(serviceAvailabilityMiddleware);

app.use(`${urls.OFFICER_FILING}*`, sessionMiddleware);
// TODO app.use(`${urls.OFFICER_FILING}*`, csrfProtectionMiddleware);

// ------------- Enable login redirect -----------------
const userAuthRegex = new RegExp("^" + urls.OFFICER_FILING + "/(?!accessibility-statement).+");
app.use(userAuthRegex, authenticationMiddleware);

app.use(commonTemplateVariablesMiddleware)
// apply our default router to /officer-filing
app.use(urls.OFFICER_FILING, router);
app.use(errorHandler, pageNotFound);
// TODO app.use(csrfErrorHandler);

logger.info("Officer filing Web has started");
export default app;
