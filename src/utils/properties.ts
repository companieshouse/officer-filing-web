/**
 * Gets an environment variable. If the env var is not set and a default value is not
 * provided, then it is assumed it is a mandatory requirement and an error will be
 * thrown.
 */
const getEnvironmentVariable = (key: string, defaultValue?: any): string => {
    const isMandatory = !defaultValue;
    const value: string = process.env[key] || "";
  
    if (!value && isMandatory) {
      throw new Error(`Please set the environment variable "${key}"`);
    }
  
    return value || defaultValue as string;
  };
  
  export const ACCOUNT_URL = getEnvironmentVariable("ACCOUNT_URL")
  
  export const COOKIE_NAME = getEnvironmentVariable("COOKIE_NAME");
  
  export const COOKIE_DOMAIN = getEnvironmentVariable("COOKIE_DOMAIN");
  
  export const COOKIE_SECRET = getEnvironmentVariable("COOKIE_SECRET");
  
  export const CACHE_SERVER = getEnvironmentVariable("CACHE_SERVER");
  
  export const SHOW_SERVICE_OFFLINE_PAGE = getEnvironmentVariable("SHOW_SERVICE_OFFLINE_PAGE");
  
  export const CHS_API_KEY = getEnvironmentVariable("CHS_API_KEY");
  
  export const CHS_URL = getEnvironmentVariable("CHS_URL");
  
  export const API_URL = getEnvironmentVariable("API_URL");
  
  export const INTERNAL_API_URL = getEnvironmentVariable("INTERNAL_API_URL");
  
  export const FEATURE_FLAG_REMOVE_DIRECTOR_20022023 = "true"; //TODO  add the feature flag and then replace true with this get getEnvironmentVariable("FEATURE_FLAG_REMOVE_DIRECTOR_20022023");
  
  export const PIWIK_START_GOAL_ID = getEnvironmentVariable("PIWIK_START_GOAL_ID");

  export const URL_LOG_MAX_LENGTH: number = parseInt(getEnvironmentVariable("URL_LOG_MAX_LENGTH", "400"), 10);
  
  export const URL_PARAM_MAX_LENGTH: number = parseInt(getEnvironmentVariable("URL_PARAM_MAX_LENGTH", "50"), 10);
  
  export const RADIO_BUTTON_VALUE_LOG_LENGTH = parseInt(getEnvironmentVariable("RADIO_BUTTON_VALUE_LOG_LENGTH", "50"), 10);
  
  export const EWF_URL = getEnvironmentVariable("EWF_URL");