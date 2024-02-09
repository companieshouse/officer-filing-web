import { Address, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { ValidationError } from "../model/validation.model";

/**
 * Interface for the renderPage function parameters
 */
export interface RenderManualEntryParams {
  originalFiling: OfficerFiling;
  serviceAddress: Address;
  validationErrors: ValidationError[];
  templateName: string;
  backUrlPath: string;
  isUpdate: boolean;
}
