jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/validation.status.service");
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import { UPDATE_DIRECTOR_DETAILS_PATH, urlParams } from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { getValidationStatus } from "../../../src/services/validation.status.service";
import {
  mockValidValidationStatusResponse
} from "../../mocks/validation.status.response.mock";
import { UPDATE_DIRECTOR_OCCUPATION_PATH } from "../../../src/types/page.urls";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director&#39;s occupation?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const DIRECTOR_OCCUPATION_URL = UPDATE_DIRECTOR_OCCUPATION_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const DIRECTOR_DETAILS_ADDRESS_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director occupation controller tests", () => {

    beforeEach(() => {
      mocks.mockAuthenticationMiddleware.mockClear();
      mocks.mockSessionMiddleware.mockClear();
      mockGetValidationStatus.mockClear();
      mockGetOfficerFiling.mockClear();
      mockPatchOfficerFiling.mockClear()
    });

    describe("get tests", () => {
  
      it("Should navigate to director occupation page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          occupation: "Astronaut",
        });
        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);

        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {

      it("Should redirect to director details page with null value for occupation", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith",
          referenceEtag: "etag"
        });
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});

        const response = await request(app).post(DIRECTOR_OCCUPATION_URL);
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_DETAILS_ADDRESS_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should redirect to director details page with valid value for occupation", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith",
          referenceEtag: "etag"
        });
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});

        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "Accountant"});
        expect(mockPatchOfficerFiling).toHaveBeenCalledTimes(1);
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_DETAILS_ADDRESS_URL);
      });


    });

});
