jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/validation.status.service");
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import { UPDATE_DIRECTOR_DETAILS_PATH, UPDATE_DIRECTOR_NAME_PATH, urlParams } from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { STOP_TYPE } from "../../../src/utils/constants";
import { doFieldsMatch } from "../../../src/controllers/shared.controllers/director.name.controller";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director&#39;s name?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

const DIRECTOR_NAME_URL = UPDATE_DIRECTOR_NAME_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const UPDATE_DIRECTOR_DETAILS_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const UPDATE_BACK_LINK_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const ETAG_STOP_PAGE_URL = `/appoint-update-remove-company-officer/company/${COMPANY_NUMBER}/cannot-use?stopType=${STOP_TYPE.ETAG}`;

describe("Update Director name controller tests", () => {

    beforeEach(() => {
      mocks.mockCreateSessionMiddleware.mockClear();
      mockGetCompanyAppointmentFullRecord.mockClear();
      mockGetOfficerFiling.mockClear();
    });

    describe("get tests", () => {
  
      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should populate filing data on the page", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
              etag: "etag",
              forename: "John",
              otherForenames: "mid",
              surname: "Smith"
               });

        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
        });

        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("John Mid Smith");
        expect(response.text).toContain("testTitle");
        expect(response.text).toContain("testFirst");
        expect(response.text).toContain("testMiddle");
        expect(response.text).toContain("testLast");
      });

      it("Should populate filing data on the page without former name field", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag",
        });

        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
        });

        const response = await request(app).get(DIRECTOR_NAME_URL);
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("testTitle");
        expect(response.text).toContain("testFirst");
        expect(response.text).toContain("testMiddle");
        expect(response.text).toContain("testLast");
        expect(response.text).not.toContain("testFormer");
      });

      it("Should render the page in welsh", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag"
          });
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
        });

        const response = await request(app).get(DIRECTOR_NAME_URL + "?lang=cy");
  
        expect(response.text).toContain("Beth yw enw’r cyfarwyddwr?");
      });

    });

    describe("post tests", () => {

      // Validate all fields change one by one in order to fix the sonar coverage issue (due to OR condition)

      it("Should redirect to View and Update Director title is updated", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag"
        });
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "app1",
          referenceEtag: "etag",
          title: "Mr",
          firstName: "John",
          middleNames: "",
          lastName: "Smith",
          formerNames: "",
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
            "previous_names_radio": "No",
            "previous_names": ""
          });
        expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
          nameHasBeenUpdated: true
        }));
      });

      it("Should redirect to View and Update Director firstName is updated", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag"
        });
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "app1",
          referenceEtag: "etag",
          title: "Dr",
          firstName: "James",
          middleNames: "",
          lastName: "Smith",
          formerNames: "",
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
            "previous_names_radio": "No",
            "previous_names": ""
          });
        expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
          nameHasBeenUpdated: true
        }));
      });

      it("Should redirect to View and Update Director middleName is updated", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag"
        });
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "app1",
          referenceEtag: "etag",
          title: "Dr",
          firstName: "John",
          middleNames: "Jimothy",
          lastName: "Smith",
          formerNames: "",
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
            "previous_names_radio": "No",
            "previous_names": ""
          });
        expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
          nameHasBeenUpdated: true
        }));
      });

      it("Should redirect to View and Update Director lastName is updated", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag",
        });
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "app1",
          referenceEtag: "etag",
          title: "Dr",
          firstName: "John",
          middleNames: "",
          lastName: "Halpert",
          formerNames: "",
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
            "previous_names_radio": "No",
            "previous_names": ""
          });
        expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
          nameHasBeenUpdated: true
        }));
      });

      it("Should redirect to update page when nothing has been updated", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          etag: "etag",
          title: "Dr",
          forename: "John",
          otherForenames: "mid",
          surname: "Smith"
        });
        mockGetOfficerFiling.mockResolvedValue({
          referenceAppointmentId: "app1",
          referenceEtag: "etag",
          title: "Dr",
          firstName: "John",
          middleNames: "",
          lastName: "Halpert"
        });
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
          }});

        const response = await request(app)
          .post(DIRECTOR_NAME_URL)
          .send({
            "typeahead_input_0": "Dr",
            "first_name": "John",
            "middle_names": "Mid",
            "last_name": "Smith"
          });
        expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_URL);
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
          nameHasBeenUpdated: false
        }));
      });

      it("should catch errors on submission if errors", async () => {
        mockPatchOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
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
        expect(response.text).not.toContain("Found. Redirecting to " + DIRECTOR_NAME_URL);
      });

      it("should set back link correctly if there are errors", async () => {
        const response = await request(app)
        .post(DIRECTOR_NAME_URL)
        .send({"first_name": "~"});

        expect(response.text).toContain(UPDATE_BACK_LINK_URL);
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

    describe("doFieldsMatch tests", () => {
      it("Should return true if fields match", () => {
        const result = doFieldsMatch("test", "test");
        expect(result).toEqual(true);
      });
  
      it("Should return false if fields do not match", () => {
        const result = doFieldsMatch("test", "test2");
        expect(result).toEqual(false);
      });
  
      it("Should return false if one field is undefined", () => {
        const result = doFieldsMatch(undefined, "test");
        expect(result).toEqual(false);
      });
  
      it("Should return true if both fields are undefined", () => {
        const result = doFieldsMatch(undefined, undefined);
        expect(result).toEqual(true);
      });
  
      it("Should return true if both fields are empty strings", () => {
        const result = doFieldsMatch("", "");
        expect(result).toEqual(true);
      });
  
      it("Should return true if one field is undefined and other field is empty string", () => {
        const result = doFieldsMatch("", undefined);
        expect(result).toEqual(true);
      }); 
    });
  
});
