jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.appointments.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { getValidationStatus } from "../../src/services/validation.status.service";
import { DIRECTOR_DATE_DETAILS_PATH, DIRECTOR_NAME_PATH, urlParams, BASIC_STOP_PAGE_PATH, URL_QUERY_PARAM } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { mockValidValidationStatusResponse } from "../mocks/validation.status.response.mock";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";
import { STOP_TYPE } from "../../src/utils/constants";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director's name?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const DIRECTOR_NAME_URL = DIRECTOR_NAME_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_DATE_DETAILS_URL = DIRECTOR_DATE_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const ETAG_STOP_PAGE_URL = "/appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=etag"

describe("Director name controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetValidationStatus.mockClear();
      mockGetOfficerFiling.mockClear();
      mockGetCompanyAppointmentFullRecord.mockClear();
    });

    describe("get tests", () => {
      it("Should navigate to director name page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "app1",
          referenceEtag: "ETAG"
        });
        const response = await request(app).get(DIRECTOR_NAME_URL).set({"referer": "director-name"});
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should populate filing data on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer"
        });

        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("testTitle");
        expect(response.text).toContain("testFirst");
        expect(response.text).toContain("testMiddle");
        expect(response.text).toContain("testLast");
        expect(response.text).toContain("testFormer");
      });

      it("Should return 'No' if officer filing name is empty string", async () => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});
        mockGetOfficerFiling.mockReturnValueOnce({
          formerNames: ""
        })
        const response = await request(app)
          .get(DIRECTOR_NAME_URL);

        expect(response.text).toContain("value=\"No\" checked")
      });

      it("Should not check former name radio buttons if officer filing name is null", async () => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});
        mockGetOfficerFiling.mockReturnValueOnce({
          formerNames: null
        })
        const response = await request(app)
          .get(DIRECTOR_NAME_URL);

        expect(response.text).not.toContain("value=\"No\" checked")
        expect(response.text).not.toContain("value=\"Yes\" checked")
      });

    });

    describe("post tests", () => {
      it("Should redirect to date of birth page if there are no errors", async () => {  
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "app1",
          referenceEtag: "ETAG"
        });
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "ETAG"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

        const response = await request(app)
          .post(DIRECTOR_NAME_URL)
          .send({ 
            "typeahead_input_0": "Dr", 
            "first_name": "John", 
            "middle_names": "", 
            "last_name": "Smith", 
            "previous_names_radio": "No", 
            "previous_names": "" 
          });
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_DATE_DETAILS_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("should catch errors on submission if errors", async () => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
        const response = await request(app)
          .post(DIRECTOR_NAME_URL)
          .send({ 
            "typeahead_input_0": "Dr", 
            "first_name": "John", 
            "middle_names": "", 
            "last_name": "Smith", 
            "previous_names_radio": "No", 
            "previous_names": "" 
          });
        expect(response.text).toContain(ERROR_PAGE_HEADING);
        expect(response.text).not.toContain("Found. Redirecting to " + DIRECTOR_DATE_DETAILS_URL);
      });

      it("Should redirect to date of birth page if there are no errors and former name is yes", async () => {
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "app1",
          referenceEtag: "ETAG"
        });
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "ETAG"
        });
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});
        const response = await request(app)
          .post(DIRECTOR_NAME_URL)
          .send({ 
            "typeahead_input_0": "Dr", 
            "first_name": "John", 
            "middle_names": "", 
            "last_name": "Smith", 
            "previous_names_radio": "Yes", 
            "previous_names": "Sparrow" 
          });
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_DATE_DETAILS_URL);
      });

      it("Should redirect to stop page if the etag fails validation", async () => {
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "app1",
          referenceEtag: "etag"
        });
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "differentEtag"
        });
        const response = await request(app)
          .post(DIRECTOR_NAME_URL)
          .send({ 
            "typeahead_input_0": "Dr", 
            "first_name": "John", 
            "middle_names": "", 
            "last_name": "Smith", 
            "previous_names_radio": "Yes", 
            "previous_names": "Sparrow" 
          });
        expect(response.text).toContain("Found. Redirecting to " + ETAG_STOP_PAGE_URL);
      });
    });
  });
