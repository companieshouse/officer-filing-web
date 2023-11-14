import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { Request } from "express";
import { urlUtils } from "../utils/url";

export interface Navigation {
  [x: string]: {
    currentPage: string;
    previousPage: ((officerFiling?: OfficerFiling, req?: Request) => Promise<string>);
    nextPage: string[];
  }
}

export const getPageUrls = (pathToPage: string, req: Request): string => {
  return urlUtils.getUrlToPath(pathToPage, req);
}