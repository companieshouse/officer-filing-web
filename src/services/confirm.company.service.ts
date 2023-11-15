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
  companyProfile.registeredOfficeAddress.premises = formatTitleCase(companyProfile.registeredOfficeAddress.premises);
  companyProfile.registeredOfficeAddress.addressLineOne = formatTitleCase(companyProfile.registeredOfficeAddress.addressLineOne);
  companyProfile.registeredOfficeAddress.addressLineTwo = formatTitleCase(companyProfile.registeredOfficeAddress.addressLineTwo);
  companyProfile.registeredOfficeAddress.locality = formatTitleCase(companyProfile.registeredOfficeAddress.locality);
  companyProfile.registeredOfficeAddress.region = formatTitleCase(companyProfile.registeredOfficeAddress.region);
  companyProfile.registeredOfficeAddress.country = formatTitleCase(companyProfile.registeredOfficeAddress.country);
  if(companyProfile.registeredOfficeAddress.postalCode != null){
    companyProfile.registeredOfficeAddress.postalCode = companyProfile.registeredOfficeAddress.postalCode.toUpperCase();
  }
  if(companyProfile.registeredOfficeAddress.poBox != null){
    companyProfile.registeredOfficeAddress.poBox = companyProfile.registeredOfficeAddress.poBox.toUpperCase();
  }
  return companyProfile;
};

export const formatTitleCase = (str: string|undefined): string =>  {
  if (!str) {
    return "";
  }

  str = str.toLowerCase();
  let formattedString = '';

  let uppercaseAfter = [" ", "-", "'"];
  let uppercaseNextCharacter = true;

  // first character is always uppercase
  for (let i = 0; i < str.length; i++) {
    if (uppercaseNextCharacter){
      formattedString += str.charAt(i).toUpperCase();
      uppercaseNextCharacter = false;
    } else {
      formattedString += str.charAt(i);
    }

    // set value of uppercaseNextCharacter for next character
    if(uppercaseAfter.includes(str.charAt(i))) {
      uppercaseNextCharacter = true;
    } else {
      uppercaseNextCharacter = false;
    }
  }
  return formattedString;
};
