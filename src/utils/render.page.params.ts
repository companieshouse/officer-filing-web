import { Address, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { ValidationError } from "../model/validation.model";

/**
 * Interface for the renderPage function parameters for array address pages
 */
export interface RenderArrayPageParams {
  officerFiling: OfficerFiling;
  ukAddresses: UKAddress[];
  validationErrors: ValidationError[];
  directorName: string,
  templateName: string;
  backUrlPath: string;
  isUpdate: boolean;
}

/**
 * Interface for the renderPage function parameters for manual address pages
 */
export interface RenderManualEntryParams {
  officerFiling: OfficerFiling;
  serviceAddress: Address;
  validationErrors: ValidationError[];
  templateName: string;
  backUrlPath: string;
  isUpdate: boolean;
}
