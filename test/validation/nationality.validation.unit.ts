jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_NATIONALITY_PATH, urlParams } from "../../src/types/page.urls";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { nationalityErrorMessageKey, nationalityOneErrorMessageKey } from "../../src/utils/api.enumerations.keys";
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";

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
      expect(response.text).toContain("Enter the director’s nationality");
    });

    it ("should render nationality error if nationality is not in the list", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"western"});
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("Select a nationality from the list");
    });

    it ("should render nationality error if nationality is contains invalid character", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"Can£adian&"});
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("Enter the director’s nationality");
    });

    it ("should not render nationality error if nationality2 is blank", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:""});
      expect(response.text).not.toContain("Enter the director’s nationality");
      expect(mockPatchOfficerFiling).toHaveBeenCalled();
    });

    it ("should render nationality error if nationality2 is not in the list", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:"London"});
      expect(response.text).toContain("Select a nationality from the list");
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });

    it ("should render nationality error if nationality2 contains invalid character", async() => {
      const response = await request(app).post(DIRECTOR_NATIONALITY_URL).send({typeahead_input_0:"British",typeahead_input_1:"(Indian)"});
      expect(response.text).toContain("Select a nationality from the list");
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
    });
  })
});