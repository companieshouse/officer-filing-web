import { LocalesService } from "@companieshouse/ch-node-utils"
import { LOCALES_ENABLED, LOCALES_PATH } from "./properties";

export const selectLang = (lang) => {
  switch(lang) {
    case "cy": return "cy";
    default: return "en";
  }
}

export const getLocalesService = () => LocalesService.getInstance(LOCALES_PATH, LOCALES_ENABLED === "true");
