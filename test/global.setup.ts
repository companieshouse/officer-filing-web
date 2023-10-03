export default () => {
  process.env.ACCOUNT_URL = 'http://account.chs.local'
  process.env.API_URL = "http://localhost:8080";
  process.env.CACHE_SERVER = "cache_server";
  process.env.CDN_HOST = "CDN_HOST";
  process.env.CHS_API_KEY = "12345";
  process.env.CHS_URL = "http://chs.local";
  process.env.COOKIE_NAME = "cookie_name";
  process.env.COOKIE_DOMAIN = "cookie_domain";
  process.env.COOKIE_SECRET = "123456789012345678901234";
  process.env.EWF_URL = "https://ewf.companieshouse.gov.uk/";
  process.env.OFFICER_FILING_WEB_ACTIVE = "true";
  process.env.FEATURE_FLAG_REMOVE_DIRECTOR_20022023 = "true";
  process.env.INTERNAL_API_URL = "http://localhost:9333";
  process.env.NODE_ENV = "development";
  process.env.PIWIK_SITE_ID = "999";
  process.env.PIWIK_START_GOAL_ID = "3";
  process.env.PIWIK_URL = "https://matomo.platform.aws.chdev.org";
  process.env.RADIO_BUTTON_VALUE_LOG_LENGTH = "50";
  process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
  process.env.URL_LOG_MAX_LENGTH = "400";
  process.env.URL_PARAM_MAX_LENGTH = "50";
  process.env.SERVICE_NAME = 'Appoint and remove a company director';
  process.env.AP01_ACTIVE = 'true';
  process.env.TITLE_LIST = 'DR';
  process.env.OCCUPATION_LIST = 'Astronaut';
  process.env.NATIONALITY_LIST = 'British';
  process.env.COUNTRY_LIST = 'England';
};
