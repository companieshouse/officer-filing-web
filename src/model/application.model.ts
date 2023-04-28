import {
  entityType,
} from "./index";

export const APPLICATION_DATA_KEY = 'roe';

export interface ApplicationData {
    entity_name?: string;
}

export const ApplicationDataArrayType = [
  "beneficial_owners_individual",
  "beneficial_owners_corporate",
  "beneficial_owners_government_or_public_authority",
  "managing_officers_individual",
  "managing_officers_corporate",
  "trusts"
];

export type ApplicationDataType =
  | entityType.Entity
