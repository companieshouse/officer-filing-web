import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { compareAddress } from "./address";

export const checkIsResidentialAddressUpdated = (officerFiling: OfficerFiling, companyAppointment: CompanyAppointment): boolean => {
  if (officerFiling.isHomeAddressSameAsServiceAddress === true) {
    return companyAppointment.residentialAddressIsSameAsServiceAddress !== true;
  }
  if (companyAppointment.residentialAddressIsSameAsServiceAddress === true) {
    return true;
  }
  return !compareAddress(officerFiling.residentialAddress, companyAppointment.usualResidentialAddress);
};

export const isCorrespondenceAddressUpdated = (officerFiling: OfficerFiling, companyAppointment: CompanyAppointment): boolean => {
  if (officerFiling.isServiceAddressSameAsRegisteredOfficeAddress === true) {
    return companyAppointment.serviceAddressIsSameAsRegisteredOfficeAddress !== true;
  }
  if (companyAppointment.serviceAddressIsSameAsRegisteredOfficeAddress === true) {
    return true;
  }
  return !compareAddress(officerFiling.serviceAddress, companyAppointment.serviceAddress);
}