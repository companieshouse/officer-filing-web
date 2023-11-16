jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_NATIONALITY_PATH, urlParams } from "../../src/types/page.urls";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { validateDuplicateNationality, validateInvalidLengthValuesForNationality, validateMaximumLengthNationality, validateNationality, validateAllowedListNationality, validateInvalidCharacterValuesForNationality } from "../../src/validation/nationality.validation";
import { NationalityValidation } from "../../src/validation/nationality.validation.config";
import { nationalityErrorMessageKey, nationalityOneErrorMessageKey, nationalityThreeErrorMessageKey, nationalityTwoErrorMessageKey } from "../../src/utils/api.enumerations.keys";
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const LONG_COUNTRY_NAME = "Kingdom of Sauron East of the North Gate British Land of the elfsoooooooqqqqqqqqaaaaaahhddddddddddyyyTTTTTTTTTTTTTAAAAAAAAHHHHHHHHHHHHHDDDDPPPPPPPPPPP"
                        + "Landoftheelfshhheeeeuuuuuuurrrooooooooooeeeeeessssssss";
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

    it ("should return nationality error if nationality exceeds length", async() => {
      const response = validateMaximumLengthNationality(["Kingdom of Sauron East of the North Gate","British","Land of the elfs"], NationalityValidation)
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48)
    });

    it ("should return nationality error if multiple nationality exceeds length", async() => {
      const response = validateMaximumLengthNationality(["British","Afghan",LONG_COUNTRY_NAME], NationalityValidation)
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48)
      expect(response?.source).toContain("typeahead_input_2")

    });

    it ("should return nationality error if multiple nationality1 and nationality3 exceeds length", async() => {
      const response = validateMaximumLengthNationality([LONG_COUNTRY_NAME,"Irish","Landoftheelfshhheeeeuuuuuuurrrooooooooooeeeeeessssssss"], NationalityValidation)
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48)
    });

    it ("should return nationality error if multiple nationality2 and nationality3 exceeds length", async() => {
      const response = validateMaximumLengthNationality(["Irish",LONG_COUNTRY_NAME,"Landoftheelfshhheeeeuuuuuuurrrooooooooooeeeeeessssssss"], NationalityValidation)
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_LENGTH_48)
    });

    it ("should return nationality duplication error if nationality two and three are duplicates", () => {
      const response = validateDuplicateNationality(["Afghan","Irish","Irish"], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityThreeErrorMessageKey.NATIONALITY_3_DUPLICATE)
    });

    it ("should return nationality duplication error if nationality one and two are duplicates", () => {
      const response = validateDuplicateNationality(["Irish","Irish","British"], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityTwoErrorMessageKey.NATIONALITY_2_DUPLICATE)
    });

    it ("should return nationality select from list error if nationality two not in list", () => {
      const response = validateAllowedListNationality(["Irish","Western"], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityErrorMessageKey.NATIONALITY_INVALID)
    });

    it ("should return nationality select from list error if nationality one not in list", () => {
      const response = validateAllowedListNationality(["Southerner"], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityErrorMessageKey.NATIONALITY_INVALID)
    });

    it ("should return nationality select from list error if nationality three not in list", () => {
      const response = validateAllowedListNationality(["British", "Irish", "Easterner"], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityErrorMessageKey.NATIONALITY_INVALID)
    });

    it ("should return validation length error if nationality1 exceeds 50 character", () => {
      const response = validateInvalidLengthValuesForNationality([LONG_COUNTRY_NAME], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50)
    });

    it ("should return validation length error if nationality2 exceeds 50 character", () => {
      const response = validateInvalidLengthValuesForNationality(["British",LONG_COUNTRY_NAME], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50)
    });

    it ("should return validation length error if nationality3 exceeds 50 character", () => {
      const response = validateInvalidLengthValuesForNationality(["British","Irish",LONG_COUNTRY_NAME], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_LENGTH_50)
    });

    it("should return invalid character error if nationality1 invalid character", () => {
      const response = validateInvalidCharacterValuesForNationality(["Brit&&&sh"], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_MISSING)
    });

    it("should return invalid character error if nationality2 invalid character", () => {
      const response = validateInvalidCharacterValuesForNationality(["British", "Home£ Island"], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_MISSING)
    });

    it("should return invalid character error if nationality2 is submitted with only empty space", () => {
      const response = validateInvalidCharacterValuesForNationality(["British", "     "], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_MISSING)
    });

    it("should return invalid character error if nationality3 is submitted with only empty space", () => {
      const response = validateInvalidCharacterValuesForNationality(["British", "Irish", "    "], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_MISSING)
    });

    it("should return invalid character error if nationality3 invalid character", () => {
      const response = validateInvalidCharacterValuesForNationality(["British", "Home Island", "Klin&on W^orld"], NationalityValidation);
      expect(response?.messageKey).toContain(nationalityOneErrorMessageKey.NATIONALITY_MISSING)
    });
  })
});