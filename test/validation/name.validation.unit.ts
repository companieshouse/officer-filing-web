jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, DIRECTOR_NAME_PATH, UPDATE_DIRECTOR_NAME_PATH, urlParams } from "../../src/types/page.urls";
import { getOfficerFiling } from "../../src/services/officer.filing.service";

const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

const FIFTY_ONE_CHARACTERS = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const TITLE_LENGTH = "Title must be 50 characters or less";
const TITLE_CHARACTERS = "Title must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes";
const FIRST_NAME_BLANK = "Enter the director’s full first name";
const FIRST_NAME_CHARACTERS = "First name must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes";
const FIRST_NAME_LENGTH = "First name must be 50 characters or less";
const MIDDLE_NAME_CHARACTERS = "Middle name or names must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes";
const MIDDLE_NAME_LENGTH = "Middle names must be 50 characters or less";
const LAST_NAME_BLANK = "Enter the director’s last name";
const LAST_NAME_CHARACTERS = "Last name must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes";
const LAST_NAME_LENGTH = "Last name must be 160 characters or less";
const FORMER_NAMES_CHARACTERS = "Previous names must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes";
const FORMER_NAMES_LENGTH = "Previous names must be 160 characters or less";
const FORMER_NAMES_MISSING = "Enter the director’s previous name or names";
const FORMER_NAME_RADIO_ERROR = "Select yes if the director used a different name for business purposes in the last 20 years";

const DIRECTOR_NAME_URL = DIRECTOR_NAME_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const UPDATE_DIRECTOR_NAME_URL = UPDATE_DIRECTOR_NAME_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director name validation tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockResolvedValueOnce({
      checkYourAnswersLink: APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
    });
  });

  describe("Name frontend validation", () => {
    // title validation
    it ("should render error if title has invalid characters", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({typeahead_input_0:"§"});
        expect(response.text).toContain(TITLE_CHARACTERS);
    });

    it ("should render error if title is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({typeahead_input_0:"Headmaster of Hogwarts, Order of Merlin (first class), Supreme Mugwump, Chief Warlock and Grand Sorcerer"});
        expect(response.text).toContain(TITLE_LENGTH);
    });

    // first name validation
    it ("should render error if first name is blank", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({first_name:""});
        expect(response.text).toContain(FIRST_NAME_BLANK);
    });

    it ("should render error if first name has invalid characters", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({first_name:"§"});
        expect(response.text).toContain(FIRST_NAME_CHARACTERS);
    });

    it ("should render error if first name is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({first_name:FIFTY_ONE_CHARACTERS});
        expect(response.text).toContain(FIRST_NAME_LENGTH);
    });

    // middle name validation
    it ("should render error if middle names has invalid characters", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({middle_names:"§"});
        expect(response.text).toContain(MIDDLE_NAME_CHARACTERS);
    });

    it ("should render error if middle names is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({middle_names:FIFTY_ONE_CHARACTERS});
        expect(response.text).toContain(MIDDLE_NAME_LENGTH);
    });

    // last name validation
    it ("should render error if last name is blank", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({last_name:""});
        expect(response.text).toContain(LAST_NAME_BLANK);
    });

    it ("should render error if last name has invalid characters", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({last_name:"§"});
        expect(response.text).toContain(LAST_NAME_CHARACTERS);
    });

    it ("should render error if last name is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({last_name:ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS});
        expect(response.text).toContain(LAST_NAME_LENGTH);
    });

    // previous names validation
    it ("should render error if previous names has invalid characters", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({
            previous_names_radio:"Yes", 
            previous_names:"§"});
        expect(response.text).toContain(FORMER_NAMES_CHARACTERS);
    });

    it ("should render error if previous names is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({
            previous_names_radio:"Yes",
            previous_names:ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS});
        expect(response.text).toContain(FORMER_NAMES_LENGTH);
    });

    it ("should not render error is previous name radio is no", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({
            previous_names_radio:"No", 
            previous_names:"§"});
        expect(response.text).not.toContain(FORMER_NAMES_CHARACTERS);
        expect(response.text).not.toContain(FORMER_NAMES_LENGTH);
    });

    it ("should render error if previous name radio is not selected", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({
            previous_names_radio:"", 
            previous_names:""});
        expect(response.text).toContain(FORMER_NAME_RADIO_ERROR);
        expect(response.text).not.toContain(FORMER_NAMES_LENGTH);
    });
    
    it ("should render error is previous name radio is yes and previous names is blank", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({
            previous_names_radio:"Yes", 
            previous_names:""});
        expect(response.text).toContain(FORMER_NAMES_MISSING);
        expect(response.text).not.toContain(FORMER_NAMES_CHARACTERS);
        expect(response.text).not.toContain(FORMER_NAMES_LENGTH);
    });

    // multiple error validation tests
    // title validation
    it ("should render one title error if title has invalid characters and is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({typeahead_input_0:"§Headmaster of Hogwarts, Order of Merlin (first class), Supreme Mugwump, Chief Warlock and Grand Sorcerer"});
        expect(response.text).toContain(TITLE_CHARACTERS);
        expect(response.text).not.toContain(TITLE_LENGTH);
    });

    // first name validation
    it ("should render one first name error if first name has invalid characters and is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({first_name:"§"+FIFTY_ONE_CHARACTERS});
        expect(response.text).toContain(FIRST_NAME_CHARACTERS);
        expect(response.text).not.toContain(FIRST_NAME_LENGTH);
        expect(response.text).not.toContain(FIRST_NAME_BLANK);
    });

    // middle name validation
    it ("should render one middle names error if middle names has invalid characters and is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({middle_names:"§"+FIFTY_ONE_CHARACTERS});
        expect(response.text).toContain(MIDDLE_NAME_CHARACTERS);
        expect(response.text).not.toContain(MIDDLE_NAME_LENGTH);
    });

    // last name validation
    it ("should render one last name error if last name has invalid characters and is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({last_name:"§"+ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS});
        expect(response.text).toContain(LAST_NAME_CHARACTERS);
        expect(response.text).not.toContain(LAST_NAME_LENGTH);
        expect(response.text).not.toContain(LAST_NAME_BLANK);
    });

    // previous names validation
    it ("should render one previous names error if previous names has invalid characters and is too long", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({
            previous_names_radio:"Yes", 
            previous_names:"§"+ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS});
        expect(response.text).toContain(FORMER_NAMES_CHARACTERS);
        expect(response.text).not.toContain(FORMER_NAMES_LENGTH);
    });

    // multiple field errors
    it ("should one error per field if all fields have errors", async() => {
        const response = await request(app).post(DIRECTOR_NAME_URL).send({
            typeahead_input_0:"§"+FIFTY_ONE_CHARACTERS,
            first_name:"",
            middle_names:"§"+FIFTY_ONE_CHARACTERS,
            last_name:"§"+ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS,
            previous_names_radio:"Yes", 
            previous_names:"§"+ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS
        });
        expect(response.text).toContain(TITLE_CHARACTERS);
        expect(response.text).toContain(FIRST_NAME_BLANK);
        expect(response.text).toContain(MIDDLE_NAME_CHARACTERS);
        expect(response.text).toContain(LAST_NAME_CHARACTERS);
        expect(response.text).toContain(FORMER_NAMES_CHARACTERS);
        expect(response.text).not.toContain(TITLE_LENGTH);
        expect(response.text).not.toContain(FIRST_NAME_LENGTH);
        expect(response.text).not.toContain(FIRST_NAME_CHARACTERS);
        expect(response.text).not.toContain(MIDDLE_NAME_LENGTH);
        expect(response.text).not.toContain(LAST_NAME_LENGTH);
        expect(response.text).not.toContain(LAST_NAME_BLANK);
        expect(response.text).not.toContain(FORMER_NAMES_LENGTH);
    });

    it ("should one error per field if all fields have errors on update", async() => {
        const response = await request(app).post(UPDATE_DIRECTOR_NAME_URL).send({
            typeahead_input_0:"§"+FIFTY_ONE_CHARACTERS,
            first_name:"",
            middle_names:"§"+FIFTY_ONE_CHARACTERS,
            last_name:"§"+ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS,
            previous_names_radio:"Yes", 
            previous_names:"§"+ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS
        });
        expect(response.text).toContain(TITLE_CHARACTERS);
        expect(response.text).toContain(FIRST_NAME_BLANK);
        expect(response.text).toContain(MIDDLE_NAME_CHARACTERS);
        expect(response.text).toContain(LAST_NAME_CHARACTERS);
        expect(response.text).not.toContain(FORMER_NAMES_CHARACTERS);
        expect(response.text).not.toContain(TITLE_LENGTH);
        expect(response.text).not.toContain(FIRST_NAME_LENGTH);
        expect(response.text).not.toContain(FIRST_NAME_CHARACTERS);
        expect(response.text).not.toContain(MIDDLE_NAME_LENGTH);
        expect(response.text).not.toContain(LAST_NAME_LENGTH);
        expect(response.text).not.toContain(LAST_NAME_BLANK);
        expect(response.text).not.toContain(FORMER_NAMES_LENGTH);
    });

    it ("should not validate previous names error if name update", async() => {
        mockGetOfficerFiling.mockResolvedValueOnce({
            checkYourAnswersLink: undefined
          });
        const response = await request(app).post(UPDATE_DIRECTOR_NAME_URL).send({
            previous_names_radio:"Yes", 
            previous_names:"§"+ONE_HUNRED_AND_SIXTY_ONE_CHARACTERS});
        expect(response.text).not.toContain(FORMER_NAMES_CHARACTERS);
        expect(response.text).not.toContain(FORMER_NAMES_LENGTH);
    });
  })
});