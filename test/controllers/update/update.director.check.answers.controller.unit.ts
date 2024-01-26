jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/company.profile.service");
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/validation.status.service");
jest.mock("../../../src/services/transaction.service");
jest.mock("../../../src/services/stop.page.validation.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { getOfficerFiling } from "../../../src/services/officer.filing.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import {
  UPDATE_DIRECTOR_CHECK_ANSWERS_PATH,
  UPDATE_DIRECTOR_SUBMITTED_PATH,
  urlParams
} from "../../../src/types/page.urls";
import { getValidationStatus } from "../../../src/services/validation.status.service";
import { mockValidValidationStatusResponse, mockValidationStatusResponse } from "../../mocks/validation.status.response.mock";
import { closeTransaction } from "../../../src/services/transaction.service";
import { getCurrentOrFutureDissolved } from "../../../src/services/stop.page.validation.service";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockCloseTransaction = closeTransaction as jest.Mock;
const mockGetCurrentOrFutureDissolved = getCurrentOrFutureDissolved as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_URL = UPDATE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = UPDATE_DIRECTOR_SUBMITTED_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_HEADING = "Check your answers before submitting the update";

describe("Director check your answers controller tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockGetCompanyProfile.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
    mockGetValidationStatus.mockClear();
  });

  describe("GET tests", () => {
    it("Should navigate to director check your answers page", async () => {
      mockGetOfficerFiling.mockResolvedValue({
        nameHasBeenUpdated: true,
        firstName: "John",
        lastName: "Doe",
        title: "Mr",
        occupation: "Director",
      });
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("John");
      expect(response.text).toContain("Doe");
      expect(response.text).toContain("Mr");
      expect(response.text).toContain("Director");
    });

    it("Should navigate to director update details page if no changes are recorded", async () => {
      mockGetOfficerFiling.mockResolvedValue({})
      const response = await request(app).get(PAGE_URL);
      expect(response.text).not.toContain(PAGE_HEADING);
      expect(response.text).toContain("update-director-details");
    });

    it("Should render page with just occupation field for director details", async () => {
      mockGetOfficerFiling.mockResolvedValue({occupationHasBeenUpdated: true, occupation: "Director Of Stuff"})
      const response = await request(app).get(PAGE_URL);
      
      expect(response.text).toContain("Occupation");
      expect(response.text).toContain("Director Of Stuff");
      expect(response.text).not.toContain("name-change-link");
      expect(response.text).not.toContain("nationality-change-link");
      expect(response.text).not.toContain("address-change-link");
    });

    it("Should render page with all fields", async () => {
      mockGetOfficerFiling.mockResolvedValue({occupationHasBeenUpdated: true, occupation: "Director Of Stuff"})
      const response = await request(app).get(PAGE_URL);
      
      expect(response.text).toContain("Occupation");
      expect(response.text).toContain("Director Of Stuff");
      expect(response.text).not.toContain("name-change-link");
      expect(response.text).not.toContain("nationality-change-link");
      expect(response.text).not.toContain("address-change-link");
    });
  });

  describe("POST tests", () => {
    it("Should redirect to confirmation submission if valid", async () => {
      mockGetCurrentOrFutureDissolved.mockResolvedValue(false);
      mockGetOfficerFiling.mockResolvedValue({referenceEtag: "etag"});
      mockGetCompanyAppointmentFullRecord.mockResolvedValue({etag: "etag"});
      mockGetValidationStatus.mockResolvedValue(mockValidValidationStatusResponse);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      const response = await request(app).post(PAGE_URL);
      expect(response.header.location).toEqual(NEXT_PAGE_URL)
    }),

    it("Should redirect to dissolved stop screen if company is dissolved", async () => {
      mockGetCurrentOrFutureDissolved.mockResolvedValue(true);
      mockGetOfficerFiling.mockResolvedValue({referenceEtag: "etag"});
      mockGetCompanyAppointmentFullRecord.mockResolvedValue({etag: "etag"});
      mockGetValidationStatus.mockResolvedValue(mockValidValidationStatusResponse);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      const response = await request(app).post(PAGE_URL);
      expect(response.header.location).toEqual(`/appoint-update-remove-company-officer/company/${COMPANY_NUMBER}/cannot-use?stopType=dissolved`)
    }),

    it("Should redirect to etag stop screen if etag does not match", async () => {
      mockGetCurrentOrFutureDissolved.mockResolvedValue(false);
      mockGetOfficerFiling.mockResolvedValue({referenceEtag: "etag"});
      mockGetCompanyAppointmentFullRecord.mockResolvedValue({etag: "differentEtag"});
      mockGetValidationStatus.mockResolvedValue(mockValidValidationStatusResponse);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      const response = await request(app).post(PAGE_URL);
      expect(response.header.location).toEqual(`/appoint-update-remove-company-officer/company/${COMPANY_NUMBER}/cannot-use?stopType=etag`)
    });

    it("Should redirect to something went wrong stop screen if api validation fails", async () => {
      mockGetCurrentOrFutureDissolved.mockResolvedValue(false);
      mockGetOfficerFiling.mockResolvedValue({referenceEtag: "etag"});
      mockGetCompanyAppointmentFullRecord.mockResolvedValue({etag: "etag"});

      mockGetValidationStatus.mockResolvedValue(mockValidationStatusResponse);
      
      const response = await request(app).post(PAGE_URL);

      expect(mockGetValidationStatus).toHaveBeenCalled();
      expect(response.header.location).toEqual(`/appoint-update-remove-company-officer/company/${COMPANY_NUMBER}/cannot-use?stopType=something-went-wrong`)
    });
  });

});