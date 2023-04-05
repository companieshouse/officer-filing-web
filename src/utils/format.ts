import { RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { CompanyOfficer, DateOfBirth } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { LOCALE_EN } from "./constants";


export const formatTitleCase = (str: string|undefined): string =>  {
  if (!str) {
    return "";
  }

  return str.replace(
    /\w\S*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    });
};

export const formatDateOfBirth = (dateOfBirth: DateOfBirth | undefined): string =>  {
  if (!dateOfBirth) {
    return "";
  }

  if (parseInt(dateOfBirth.month) < 1 || parseInt(dateOfBirth.month) > 12 ) {
    return "";
  }

  let parseDateOfBirth = new Date(parseInt(dateOfBirth.year), (parseInt(dateOfBirth.month) - 1));
  
  let dateOfBirthStr = parseDateOfBirth.toLocaleString('default', {month: 'long'}) +
      ' ' + parseDateOfBirth.getFullYear();

  return dateOfBirthStr;
};

export const formatAppointmentDate = (appointedOn: string | undefined): string =>  {
  if (!appointedOn) {
    return "";
  }

  let appointedOnSplit = appointedOn.split("-");

  if (parseInt(appointedOnSplit[1]) < 1 || parseInt(appointedOnSplit[1]) > 12 ) {
    return "";
  }

  let parseAppointedOn = new Date(parseInt(appointedOnSplit[0]), (parseInt(appointedOnSplit[1]) - 1),  parseInt(appointedOnSplit[2]));
  
  let appointmentDateStr = parseAppointedOn.getDate() + ' ' + parseAppointedOn.toLocaleString('default', {month: 'long'}) +
      ' ' + parseAppointedOn.getFullYear();

  return appointmentDateStr;
};


export const toUpperCase = (str: string | undefined): string => {
  if (!str) {
    return "";
  }
  return str.toUpperCase();
};

export const equalsIgnoreCase = (compareTo: string, compare: string): boolean => {
  return compare.localeCompare(compareTo, LOCALE_EN, { sensitivity: 'accent' }) === 0;
};
