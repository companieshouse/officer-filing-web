import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { ValidationError } from "../model/validation.model";

/**
 * Interface for the renderPage function parameters
 * Interface created to alleviate the sonar smell for methods over 7 parameters
 */
export interface RenderPageParams {
  officerFiling: OfficerFiling;
  ukAddresses: UKAddress[];
  validationErrors: ValidationError[];
  templateName: string;
  backUrlPath: string;
  isUpdate: boolean;
}