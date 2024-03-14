import { Address } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
/**
 * Determine whether two addresses are identical.
 * @param dateToConvert 
 * @param lang 
 * @returns true if the address' are identical
 */
export const compareAddress = (addressOne: Address | undefined, addressTwo: Address | undefined): boolean => {
  if (addressOne?.premises?.toLowerCase().trim() !== addressTwo?.premises?.toLowerCase().trim()){
    return false;
  }
  if (addressOne?.addressLine1.toLowerCase().trim() !== addressTwo?.addressLine1?.toLowerCase().trim()){
    return false;
  }
  if (addressOne?.addressLine2?.toLowerCase().trim() !== addressTwo?.addressLine2?.toLowerCase().trim()){
    return false;
  }
  if (addressOne?.country?.toLowerCase().trim() !== addressTwo?.country?.toLowerCase().trim()){
    return false;
  }
  if (addressOne?.locality?.toLowerCase().trim() !== addressTwo?.locality?.toLowerCase().trim()){
    return false;
  }
  if (addressOne?.postalCode?.toLowerCase().trim() !== addressTwo?.postalCode?.toLowerCase().trim()){
    return false;
  }
  if (addressOne?.region?.toLowerCase().trim() !== addressTwo?.region?.toLowerCase().trim()){
    return false;
  }
  return true;
};