jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/validation.status.service");
jest.mock("../../../src/services/officer.filing.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import { UPDATE_DIRECTOR_DETAILS_PATH, UPDATE_DIRECTOR_NAME_PATH, urlParams } from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

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

describe("Update Director name controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
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
        });

        const response = await request(app).get(DIRECTOR_NAME_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("testTitle");
        expect(response.text).toContain("testFirst");
        expect(response.text).toContain("testMiddle");
        expect(response.text).toContain("testLast");
      });

      it("Should populate filing data on the page without former name field", async () => {
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
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
        });

        const response = await request(app).get(DIRECTOR_NAME_URL + "?lang=cy");
  
        expect(response.text).toContain("to be translated");
      });

    });

    describe("post tests", () => {

      // Validate all fields change one by one in order to fix the sonar coverage issue (due to OR condition)

      it("Should redirect to View and Update Director title is updated", async () => {
        mockGetOfficerFiling.mockResolvedValue({
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
      });

      it("Should redirect to View and Update Director firstName is updated", async () => {
        mockGetOfficerFiling.mockResolvedValue({
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
      });

      it("Should redirect to View and Update Director middleName is updated", async () => {
        mockGetOfficerFiling.mockResolvedValue({
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
      });

      it("Should redirect to View and Update Director lastName is updated", async () => {
        mockGetOfficerFiling.mockResolvedValue({
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
    });
});
