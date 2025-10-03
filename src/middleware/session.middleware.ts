import { SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import { COOKIE_DOMAIN, COOKIE_NAME, COOKIE_SECRET } from "../utils/properties";

export const createSessionMiddleware = (sessionStore: SessionStore) => SessionMiddleware({
  cookieDomain: COOKIE_DOMAIN,
  cookieName: COOKIE_NAME,
  cookieSecret: COOKIE_SECRET,
  cookieSecureFlag: undefined,
  cookieTimeToLiveInSeconds: undefined,
}, sessionStore, true);
