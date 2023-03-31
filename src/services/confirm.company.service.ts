import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { lookupCompanyStatus, lookupCompanyType } from "../utils/api.enumerations";
import { toReadableFormat } from "../utils/date";

export const buildAddress = (addressArray: Array<string>): string => {
  let address = "";
  for(const addressValue of addressArray) {
    if(addressValue != null && addressValue != ""){
      address = address + addressValue;
      address = address + "<br>";
    }
  }
  return address;
}

export const formatForDisplay = (companyProfile: CompanyProfile): CompanyProfile => {
  companyProfile.type = lookupCompanyType(companyProfile.type);
  companyProfile.companyStatus = lookupCompanyStatus(companyProfile.companyStatus);
  companyProfile.dateOfCreation = toReadableFormat(companyProfile.dateOfCreation);
  companyProfile.registeredOfficeAddress.addressLineOne = formatTitleCase(companyProfile.registeredOfficeAddress.addressLineOne);
  companyProfile.registeredOfficeAddress.locality = formatTitleCase(companyProfile.registeredOfficeAddress.locality);
  companyProfile.registeredOfficeAddress.region = formatTitleCase(companyProfile.registeredOfficeAddress.region);
  if(companyProfile.registeredOfficeAddress.postalCode != null){
    companyProfile.registeredOfficeAddress.postalCode = companyProfile.registeredOfficeAddress.postalCode.toUpperCase();
  }
  return companyProfile;
};

export const formatTitleCase = (str: string|undefined): string =>  {
  if (!str) {
    return "";
  }

  return str.replace(
    /\w\S*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    });
};
