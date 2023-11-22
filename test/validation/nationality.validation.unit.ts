jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_NATIONALITY_PATH, urlParams } from "../../src/types/page.urls";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";

const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const LONG_COUNTRY_NAME = "Kingdom of Sauron East of the North Gate Shires";
const SHORT_NATIONALITY = "East of the North Gate Shires";
const LENGTH_FIFTY_ERROR = "Nationality must be 50 characters or less";

const ENTER_DIRECTOR_NATIONALITY_ERROR = "Enter the director’s nationality";
const SELECT_NATIONALITY_FROM_LIST_ERROR = "Select a nationality from the list";

const DIRECTOR_NATIONALITY_URL = DIRECTOR_NATIONALITY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director nationality controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockResolvedValueOnce({
      checkYourAnswersLink: APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
      firstName: "John",
      lastName: "Smith"
    });
    mockPatchOfficerFiling.mockResolvedValueOnce({data:{
    }});
    
  });

  describe("Nationality front end Validation", () => {
    it ("should render nationality error if nationality is blank", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:""});
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain(ENTER_DIRECTOR_NATIONALITY_ERROR);
    });

    it ("should catch render error", async() => {
      mockGetOfficerFiling.mockReset();
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:""});
      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it ("should render nationality error if nationality is not in the list", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"western"});
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain(SELECT_NATIONALITY_FROM_LIST_ERROR);
    });

    it ("should render nationality error if nationality is contains invalid character", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"Can£adian&"});
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain(ENTER_DIRECTOR_NATIONALITY_ERROR);
    });

    it ("should not render nationality error if nationality2 is blank", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:""});
      expect(response.text).not.toContain(ENTER_DIRECTOR_NATIONALITY_ERROR);
      expect(mockPatchOfficerFiling).toHaveBeenCalled();
    });

    it ("should render nationality error if nationality2 is not in the list", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:"London"});
      expect(response.text).toContain(SELECT_NATIONALITY_FROM_LIST_ERROR);
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality error if nationality2 contains invalid character", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:"(Indian)"});
      expect(response.text).toContain(ENTER_DIRECTOR_NATIONALITY_ERROR);
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality error if nationality is duplicated", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:"British"});
      expect(response.text).toContain("Enter a different second nationality");
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality error if nationality 1 and 3 are duplicate", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:"Country",typeahead_input_2:"British"});
      expect(response.text).toContain("Enter a different third nationality");
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality error if nationality 2 and 3 are duplicate", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:"Country",typeahead_input_2:"Country"});
      expect(response.text).toContain("Select a nationality from the list");
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality length error if nationality 1 and 3 exceed maximum length", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:"British",typeahead_input_2:LONG_COUNTRY_NAME});
      expect(response.text).toContain("For technical reasons, we are currently unable to accept multiple nationalities");
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality length error if nationality 1 maximum length 50", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:LONG_COUNTRY_NAME+SHORT_NATIONALITY});
      expect(response.text).toContain(LENGTH_FIFTY_ERROR);
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality length error if nationality 1 AND 2 exceeds maximum length 49", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:LONG_COUNTRY_NAME,typeahead_input_1:SHORT_NATIONALITY+LONG_COUNTRY_NAME});
      expect(response.text).toContain("dual nationalities with a total of more than 49 characters");
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality length error if nationality 1 AND 3 exceeds maximum length 49", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:LONG_COUNTRY_NAME,typeahead_input_2:SHORT_NATIONALITY+LONG_COUNTRY_NAME});
      expect(response.text).toContain("dual nationalities with a total of more than 49 characters");
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality length error if nationality 1,2 and 3 exceeds maximum length 49", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:SHORT_NATIONALITY,typeahead_input_2:SHORT_NATIONALITY+LONG_COUNTRY_NAME});
      expect(response.text).toContain(LENGTH_FIFTY_ERROR);
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });
  });
});