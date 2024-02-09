jest.mock("../../src/services/company.appointments.service");

import { Resource } from "@companieshouse/api-sdk-node";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";

export const validCompanyAppointment: CompanyAppointment = {
    serviceAddress: {
        premises: "premises 1",
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        locality: "locality 1",
        region: "region 1",
        country: "UK",
        postalCode: "postal code 1",
    },
    links: {
        self: "self-link",
        officer: {
            appointments: "appointments-link"
        }
    },
    name: "John elizabeth Doe",
    forename: "John",
    surname: "Doe",
    title: "Mr",
    otherForenames: "Elizabeth",
    dateOfBirth: {
      day: "1",
      month: "2",
      year: "2001"
    },
    appointedOn: "2019-05-11",
    formerNames: [
      {
        forenames: "John",
        surname: "Smith"
      },
      {
        forenames: "Old",
        surname: "MacDonald"
      }
    ],
    nationality: "British,American,Canadian",
    occupation: "Software Engineer",
    officerRole: "director",
    etag: "etag",
    personNumber: "123456",
    isPre1992Appointment: false,
    serviceAddressIsSameAsRegisteredOfficeAddress: true,
    usualResidentialAddress: {
        premises: "premises 01",
        addressLine1: "address line 01",
        addressLine2: "address line 02",
        locality: "locality 2",
        region: "region 2",
        country: "England",
        postalCode: "postal code 2",
    }
};

export const companyAppointmentMissingMiddleName: CompanyAppointment = {
    serviceAddress: {
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        country: "UK",
        locality: "locality"
    },
    links: {
        self: "self-link",
        officer: {
            appointments: "appointments-link"
        }
    },
    name: "Doe, John",
    forename: "John",
    surname: "Doe",
    otherForenames: "",
    officerRole: "director",
    etag: "etag",
    personNumber: "123456",
    isPre1992Appointment: false,
    usualResidentialAddress: {
        addressLine1: "address line 3",
        addressLine2: "address line 4",
        country: "England",
        locality: "locality2"
    }
};

export const companyAppointmentMissingName: CompanyAppointment = {
    serviceAddress: {
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        country: "UK",
        locality: "locality"
    },
    links: {
        self: "self-link",
        officer: {
            appointments: "appointments-link"
        }
    },
    name: "",
    forename: "",
    surname: "",
    otherForenames: "",
    officerRole: "director",
    etag: "etag",
    personNumber: "123456",
    isPre1992Appointment: false,
    usualResidentialAddress: {
        addressLine1: "address line 3",
        addressLine2: "address line 4",
        country: "England",
        locality: "locality2"
    }
};

export const companyAppointmentCorporateDirector: CompanyAppointment = {
    serviceAddress: {
        addressLine1: "address line 1",
        addressLine2: "address line 2",
        country: "UK",
        locality: "locality"
    },
    links: {
        self: "self-link",
        officer: {
            appointments: "appointments-link"
        }
    },
    name: "REACTIONLIQUOR CESSPOOLLIQUOR REGRET",
    forename: "",
    surname: "",
    otherForenames: "",
    officerRole: "corporate-director",
    etag: "etag",
    personNumber: "123456",
    isPre1992Appointment: true,
    usualResidentialAddress: {
        addressLine1: "address line 3",
        addressLine2: "address line 4",
        country: "England",
        locality: "locality2"
    }
};

export const validCompanyAppointmentResource: Resource<CompanyAppointment> = {
    httpStatusCode: 200,
    resource: validCompanyAppointment,
  };