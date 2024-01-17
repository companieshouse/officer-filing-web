import { CompanyOfficer, DateOfBirth, OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { LOCALE_EN } from "./constants";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";

export const formatTitleCase = (str: string|undefined): string =>  {
  if (!str) {
    return "";
  }

  return str.replace(
    /\w\S*/g, (word) => {
      return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    });
};

export const formatSentenceCase = (str: string|undefined): string =>  {
  if (!str) {
    return "";
  }

  return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
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
  if (!appointedOn || appointedOn === "") {
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

export const retrieveDirectorNameFromAppointment = (appointment: CompanyAppointment ): string => {
  if (appointment.forename) { appointment.forename = appointment.forename.trim()}
  if (appointment.otherForenames) { appointment.otherForenames = appointment.otherForenames.trim()}
  if (appointment.surname) { appointment.surname = appointment.surname.trim()}
  if (appointment.name) { appointment.name = appointment.name.trim()}

  if (appointment.forename && appointment.otherForenames && appointment.surname) {
    return appointment.forename + " "  + appointment.otherForenames + " " + appointment.surname;
  }
  else if (appointment.forename && appointment.surname) {
    return appointment.forename + " " + appointment.surname;
  }
  else if (appointment.name) {
    return appointment.name;
  }
  else {
    return "";
  }
}

export const retrieveDirectorNameFromOfficer = (officer: CompanyOfficer ): string => {
  if (officer.forename) { officer.forename = officer.forename.trim()}
  if (officer.otherForenames) { officer.otherForenames = officer.otherForenames.trim()}
  if (officer.surname) { officer.surname = officer.surname.trim()}
  if (officer.name) { officer.name = officer.name.trim()}

  if (officer.forename && officer.otherForenames && officer.surname) {
    return officer.forename + " "  + officer.otherForenames + " " + officer.surname;
  }
  else if (officer.forename && officer.surname) {
    return officer.forename + " " + officer.surname;
  }
  else if (officer.name) {
    return officer.name;
  }
  else {
    return "";
  }
}

export const retrieveDirectorNameFromFiling = (filing: OfficerFiling ): string => {
  if (filing.firstName) { filing.firstName = filing.firstName.trim()}
  if (filing.middleNames) { filing.middleNames = filing.middleNames.trim()}
  if (filing.lastName) { filing.lastName = filing.lastName.trim()}
  if (filing.name) { filing.name = filing.name.trim()}

  if (filing.firstName && filing.middleNames && filing.lastName) {
    return filing.firstName + " "  + filing.middleNames + " " + filing.lastName;
  }
  else if (filing.firstName && filing.lastName) {
    return filing.firstName + " " + filing.lastName;
  }
  else if (filing.name) {
    return filing.name;
  }
  else {
    return "";
  }
}
