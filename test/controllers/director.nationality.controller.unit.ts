jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_NATIONALITY_PATH, DIRECTOR_OCCUPATION_PATH, DIRECTOR_DATE_DETAILS_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getValidationStatus } from "../../src/services/validation.status.service";
import { mockValidValidationStatusResponse, mockValidationStatusErrorNationalityInvalid, mockValidationStatusErrorNationalityLength } from "../mocks/validation.status.response.mock";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director's nationality?";
const PAGE_HEADING_WELSH = "Beth yw cenedligrwydd y cyfarwyddwr?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

const DIRECTOR_NATIONALITY_URL = DIRECTOR_NATIONALITY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const DIRECTOR_OCCUPATION_URL = DIRECTOR_OCCUPATION_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const BACK_LINK_URL = DIRECTOR_DATE_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director nationality controller tests", () => {

    beforeEach(() => {
      mocks.mockCreateSessionMiddleware.mockClear();
      mockGetValidationStatus.mockClear();
      mockPatchOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to director nationality page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          nationality1: "Welsh",
        });
        const response = await request(app).get(DIRECTOR_NATIONALITY_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should render the page title in welsh", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          nationality1: "nationality1",
          nationality2: "nationality2",
          nationality3: "nationality3",
        });

        const response = await request(app).get(DIRECTOR_NATIONALITY_URL + "?lang=cy");
        expect(response.text).toContain(PAGE_HEADING_WELSH);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_NATIONALITY_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {
  
      it("Should redirect to director occupation page", async () => {
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});
        const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British"});
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_OCCUPATION_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should redirect to director occupation page with lang cy if provided", async () => {
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
          }});

        const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British", lang:"cy"});
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_OCCUPATION_URL + "?lang=cy");
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should just display select a nationality error on page if get validation status returns errors and nationality is not from allowed list", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorNationalityInvalid, mockValidationStatusErrorNationalityLength],
          isValid: false
        }
        const mockPatchOfficerFilingResponse = { 
          data:  {firstName: "John",
                  lastName: "Smith"}
        }
        mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
        mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
        mockGetOfficerFiling.mockResolvedValueOnce({
          checkYourAnswersLink: APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
          firstName: "John",
          lastName: "Smith"
        });
        
        const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"dj",typeahead_input_1:"dj",typeahead_input_2:"dj"});
  
        expect(response.text).toContain("Select a nationality from the list");
        expect(response.text.includes("For technical reasons, we are currently unable to accept multiple nationalities with a total of more than 48 characters")).toEqual(false);
        expect(response.text).toContain("John Smith");
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("Should display nationality length error on page", async () => {
        const mockValidationStatusResponse: ValidationStatusResponse = {
          errors: [mockValidationStatusErrorNationalityLength],
          isValid: false
        }
        const mockPatchOfficerFilingResponse = { 
          data:  {firstName: "John",
                  lastName: "Smith"}
        }
        mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
        mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
        mockGetOfficerFiling.mockResolvedValueOnce({
          checkYourAnswersLink: APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
          firstName: "John",
          lastName: "Smith"
        });

        const response = await request(app).post(DIRECTOR_NATIONALITY_URL);
  
        expect(response.text).not.toContain("For technical reasons, we are currently unable to accept multiple nationalities with a total of more than 48 characters");
        expect(response.text).toContain("Enter the director’s nationality");
        expect(mockGetValidationStatus).not.toHaveBeenCalled();
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("should set back link correctly if there are errors", async () => {
        mockGetOfficerFiling.mockResolvedValue({
          firstName: "John",
          lastName: "Smith"
        })
        const response = await request(app)
        .post(DIRECTOR_NATIONALITY_URL)
        .send({"nationality1": "~"});

        expect(response.text).toContain(BACK_LINK_URL);
      });

      it("should persist back link in welsh correctly if there are errors", async () => {
        mockGetOfficerFiling.mockResolvedValue({
          firstName: "John",
          lastName: "Smith"
        })
        const WELSH_LANG = "?lang=cy";
        const response = await request(app)
        .post(DIRECTOR_NATIONALITY_URL + WELSH_LANG)
        .send({"nationality1": "~"});

        expect(response.text).toContain(BACK_LINK_URL + WELSH_LANG);
      });
    });
});