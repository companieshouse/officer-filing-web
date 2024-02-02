import { Address, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";

/**
 * Determine whether an update has occured for correspondence address in the given officer filing.
 * @param officerFiling 
 * @param companyAppointment 
 * @returns 
 */
export const checkCorrespondenceAddressUpdate = (officerFiling: OfficerFiling, companyAppointment: CompanyAppointment): boolean => {
  if(officerFiling.isServiceAddressSameAsRegisteredOfficeAddress !== companyAppointment.isServiceAddressSameAsRegisteredOfficeAddress){
    return false;
  }
  return compareAddress(officerFiling.serviceAddress, companyAppointment.serviceAddress);
}


/**
 * Determine whether an update has occured for residential address in the given officer filing.
 * @param officerFiling 
 * @param companyAppointment 
 * @returns 
 */
export const checkResidentialAddressUpdate = (officerFiling: OfficerFiling, companyAppointment: CompanyAppointment): boolean => {
  if(officerFiling.isHomeAddressSameAsServiceAddress !== companyAppointment.isHomeAddressSameAsServiceAddress){
    return false;
  }
  return compareAddress(officerFiling.serviceAddress, companyAppointment.serviceAddress);
}


/**
 * Determine whether two addresses are identical.
 * @param dateToConvert 
 * @param lang 
 * @returns true if the address' are identical
 */
export const compareAddress = (addressOne: Address | undefined, addressTwo: Address | undefined): boolean => {
  if (!(addressOne?.premises?.toLowerCase().trim() === addressTwo?.premises?.toLowerCase().trim())){
    return false;
  }
  if (!(addressOne?.addressLine1.toLowerCase().trim() === addressTwo?.addressLine1.toLowerCase().trim())){
    return false;
  }
  if (!(addressOne?.addressLine2?.toLowerCase().trim() === addressTwo?.addressLine2?.toLowerCase().trim())){
    return false;
  }
  if (!(addressOne?.country.toLowerCase().trim() === addressTwo?.country.toLowerCase().trim())){
    return false;
  }
  if (!(addressOne?.locality.toLowerCase().trim() === addressTwo?.locality.toLowerCase().trim())){
    return false;
  }
  if (!(addressOne?.postalCode?.toLowerCase().trim() === addressTwo?.postalCode?.toLowerCase().trim())){
    return false;
  }
  if (!(addressOne?.region?.toLowerCase().trim() === addressTwo?.region?.toLowerCase().trim())){
    return false;
  }
  return true;
};

