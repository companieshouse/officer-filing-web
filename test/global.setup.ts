export default () => {
  process.env.ACCOUNT_URL = 'http://account.chs.local'
  process.env.COOKIE_NAME = "cookie_name";
  process.env.COOKIE_DOMAIN = "cookie_domain";
  process.env.COOKIE_SECRET = "123456789012345678901234";
  process.env.CACHE_SERVER = "cache_server";
  process.env.SHOW_SERVICE_OFFLINE_PAGE = "false";
  process.env.CHS_API_KEY = "12345";
  process.env.API_URL = "http://localhost:8080";
//  process.env.INTERNAL_API_URL = "http://localhost:9333";
  process.env.FEATURE_FLAG_REMOVE_DIRECTOR_20022023 = "true";
  process.env.CHS_URL = "http://chs.local";
  process.env.PIWIK_START_GOAL_ID = "3";
  process.env.URL_LOG_MAX_LENGTH = "400";
  process.env.URL_PARAM_MAX_LENGTH = "50";
  process.env.RADIO_BUTTON_VALUE_LOG_LENGTH = "50";
  process.env.EWF_URL = "https://ewf.companieshouse.gov.uk/";
};
