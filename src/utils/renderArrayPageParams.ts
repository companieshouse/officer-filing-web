import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { ValidationError } from "../model/validation.model";

/**
 * Interface for the renderPage function parameters
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