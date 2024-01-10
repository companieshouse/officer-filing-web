import { RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";

export const validateRegisteredAddressComplete = (registeredOfficeAddress: RegisteredOfficeAddress | undefined): boolean => {
  return registeredOfficeAddress !== undefined && registeredOfficeAddress.premises !== undefined && registeredOfficeAddress.premises !== "" &&
    registeredOfficeAddress.addressLineOne !== undefined && registeredOfficeAddress.addressLineOne !== "" &&
    registeredOfficeAddress.locality !== undefined && registeredOfficeAddress.locality !== "" &&
    registeredOfficeAddress.postalCode !== undefined && registeredOfficeAddress.postalCode !== "" &&
    registeredOfficeAddress.country !== undefined && registeredOfficeAddress.country !== "";
 }
