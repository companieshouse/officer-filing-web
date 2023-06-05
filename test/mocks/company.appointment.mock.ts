jest.mock("../../src/services/company.appointments.service");

import { Resource } from "@companieshouse/api-sdk-node";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";

export const validCompanyAppointment: CompanyAppointment = {
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
    name: "John Elizabeth Doe",
    forename: "John",
    surname: "Doe",
    otherForenames: "Elizabeth",
    officerRole: "director",
    etag: "etag",
    personNumber: "123456",
    isPre1992Appointment: false
};

export const validCompanyAppointmentResource: Resource<CompanyAppointment> = {
    httpStatusCode: 200,
    resource: validCompanyAppointment,
  };