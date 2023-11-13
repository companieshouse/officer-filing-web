import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { Request } from "express";

export interface Navigation {
  [x: string]: {
    currentPage: string;
    previousPage: ((officerFiling?: OfficerFiling, req?: Request) => string);
    nextPage: string[];
  }
}