jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/utils/logger");
jest.mock("../../src/utils/date");
jest.mock("../../src/utils/api.enumerations");
jest.mock("../../src/services/api.service");

import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";
import { Resource } from "@companieshouse/api-sdk-node";
import { createAndLogError } from "../../src/utils/logger";
import { CompanyAppointment } from "private-api-sdk-node/dist/services/company-appointments/types";
import { validCompanyAppointmentResource } from "../mocks/company.appointment.mock";
import { Session } from "@companieshouse/node-session-handler";
import { createPrivateOAuthApiClient } from "../../src/services/api.service";

const mockCreateApiClient = createPrivateOAuthApiClient as jest.Mock;
const mockGetCompanyAppointmentFullRecord = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreateApiClient.mockReturnValue({
  companyAppointments: {
    getCompanyAppointmentFullRecord: mockGetCompanyAppointmentFullRecord
  }
});
mockCreateAndLogError.mockReturnValue(new Error());

const clone = (objectToClone: any): any => {
  return JSON.parse(JSON.stringify(objectToClone));
};

let session: any;
const COMPANY_NUMBER = "1234567";
const APPOINTMENT_ID = "11223344"
const TRANSACTION_ID = "987654321";

describe("Company Appointments service test", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    session = new Session;
  });

  describe("getCompanyAppointmentFullRecord tests", () => {

    it("Should return a valid company appointment", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(clone(validCompanyAppointmentResource));
      const returnedAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, COMPANY_NUMBER, APPOINTMENT_ID);

      Object.getOwnPropertyNames(validCompanyAppointmentResource.resource).forEach(property => {
        expect(returnedAppointment).toHaveProperty(property);
      });
    });

    it("Should return a company appointment with obfuscated usual residential address if officer is secure", async () => {
      const response = clone(validCompanyAppointmentResource);
      response.resource.isSecureOfficer = true;

      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(response);
      const returnedAppointment: CompanyAppointment = await getCompanyAppointmentFullRecord(session, COMPANY_NUMBER, APPOINTMENT_ID);

      expect(returnedAppointment.isSecureOfficer).toEqual(true);
      Object.getOwnPropertyNames(returnedAppointment.usualResidentialAddress).forEach(property => {
        expect(returnedAppointment.usualResidentialAddress[property]).toEqual("*******");
      });
    });

    it("Should throw an error if status code >= 400", async () => {
      const HTTP_STATUS_CODE = 400;
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        httpStatusCode: HTTP_STATUS_CODE
      } as Resource<CompanyAppointment>);

      await getCompanyAppointmentFullRecord(session, COMPANY_NUMBER, APPOINTMENT_ID)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${HTTP_STATUS_CODE}`));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${APPOINTMENT_ID}`));
        });
    });

    it("Should throw an error if no response returned from SDK", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(undefined);

      await getCompanyAppointmentFullRecord(session, COMPANY_NUMBER, APPOINTMENT_ID)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no response"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${APPOINTMENT_ID}`));
        });
    });

    it("Should throw an error if no response resource returned from SDK", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({} as Resource<CompanyAppointment>);

      await getCompanyAppointmentFullRecord(session, COMPANY_NUMBER, APPOINTMENT_ID)
        .then(() => {
          fail("Was expecting an error to be thrown.");
        })
        .catch(() => {
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining("no resource"));
          expect(createAndLogError).toHaveBeenCalledWith(expect.stringContaining(`${APPOINTMENT_ID}`));
        });
    });
  });
});
