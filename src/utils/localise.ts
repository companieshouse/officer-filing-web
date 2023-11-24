import { LocalesService } from "@companieshouse/ch-node-utils"
import { LOCALES_ENABLED, LOCALES_PATH } from "./properties";

export const selectLang = (lang): string => {
  switch(lang) {
    case "cy": return "cy";
    default: return "en";
  }
}

export const addLangToUrl = (url: string, lang: string): string => {
  if (url.includes("?")) {
    return url + "&lang=" + lang;
  } else {
    return url + "?lang=" + lang;
  }
}

const localesSevice = LocalesService.getInstance(LOCALES_PATH, LOCALES_ENABLED === "true");

export const getLocalesService = () => localesSevice;
