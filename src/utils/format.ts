import { RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ActiveOfficerDetails, Address } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { LOCALE_EN } from "./constants";


export const equalsIgnoreCase = (compareTo: string, compare: string): boolean => {
  return compare.localeCompare(compareTo, LOCALE_EN, { sensitivity: 'accent' }) === 0;
};
