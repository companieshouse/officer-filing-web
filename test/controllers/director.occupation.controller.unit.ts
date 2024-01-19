jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_OCCUPATION_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getValidationStatus } from "../../src/services/validation.status.service";
import {
  mockValidationStatusErrorOccupation,
  mockValidValidationStatusResponse
} from "../mocks/validation.status.response.mock";
import { ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { buildValidationErrors } from "../../src/controllers/shared.controllers/director.occupation.controller";
import { occupationErrorMessageKey } from "../../src/utils/api.enumerations.keys";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const APPOINTMENT_ID = "987654321";
const PAGE_HEADING = "What is the director&#39;s occupation?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const DIRECTOR_OCCUPATION_URL = DIRECTOR_OCCUPATION_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const DIRECTOR_CORRESPONDENCE_ADDRESS_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
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

      it("Should navigate to director occupation page in welsh", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          occupation: "Astronaut",
        });
        const response = await request(app).get(DIRECTOR_OCCUPATION_URL + "?lang=cy");
  
        expect(response.text).toContain("to be translated");
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);

        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should populate filing data on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          occupation: "Astronaut",
        });

        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);

        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("Astronaut");
      });

      it("Should display full director name on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "Jim",
          middleNames: "Mid",
          lastName: "Smith"
        });

        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);

        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("Jim Mid Smith");
      });

      it("Should display director name without middle name on the page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "Jim",
          lastName: "Smith"
        });

        const response = await request(app).get(DIRECTOR_OCCUPATION_URL);

        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("Jim Smith");
      });

      it("should catch errors on get if errors", async () => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
        const response = await request(app)
          .get(DIRECTOR_OCCUPATION_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {

      it("Should redirect to correspondence page with null value for occupation", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});

        const response = await request(app).post(DIRECTOR_OCCUPATION_URL);
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_CORRESPONDENCE_ADDRESS_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should redirect to correspondence page with valid value for occupation", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});

        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "Accountant"});
        expect(mockPatchOfficerFiling).toHaveBeenCalledTimes(1);
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_CORRESPONDENCE_ADDRESS_URL);
      });

      it("Should redirect to correspondence page with valid value for occupation - special characters set 1", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});

        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "-,.:; 0-9A-Z&@$£¥€'\"«»''\"\"?!/\\\\()[\\]{}<>*=#%+"});
        expect(mockPatchOfficerFiling).toHaveBeenCalledTimes(1);
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_CORRESPONDENCE_ADDRESS_URL);
      });

      it("Should redirect to correspondence page with valid value for occupation - special characters set 2", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});

        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽ"});
        expect(mockPatchOfficerFiling).toHaveBeenCalledTimes(1);
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_CORRESPONDENCE_ADDRESS_URL);
      });

      it("Should redirect to correspondence page with valid value for occupation - special characters set 3", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});

        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "a-zÀÖØſƒǺẀỲàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķ"});
        expect(mockPatchOfficerFiling).toHaveBeenCalledTimes(1);
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_CORRESPONDENCE_ADDRESS_URL);
      });

      it("Should redirect to correspondence page with valid value for occupation - special characters set 4", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith"
        });
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});

        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "ĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž"});
        expect(mockPatchOfficerFiling).toHaveBeenCalledTimes(1);
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_CORRESPONDENCE_ADDRESS_URL);
      });

      it("Should display character error on page if invalid characters exist in the field", async () => {
          mockGetOfficerFiling.mockResolvedValueOnce({
            referenceAppointmentId: APPOINTMENT_ID,
            firstName: "John",
            lastName: "Smith"
          })
        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "ゃ"});
  
        expect(response.text).toContain("Occupation must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
        expect(response.text).toContain("John Smith");
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("Should display length error on page if invalid characters exist in the field", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith"
        })
        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "HBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVICNAPFPORIVNEDPDSLKMDVPEPLKMVPKNRPINVOJNSDLMNAPHBHADFAEPQEIFJVIAEFAEFAEFFAAEFAEFAEFAEAEFAEFAEFAFAEFAFAEFAEFAEFAEFAEFAEFAEFAEFEAF"});

        expect(response.text).toContain("Occupation must be 100 characters or less");
        expect(response.text).toContain("John Smith");
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("Should follow the order of validation errors, where character type takes priority over length.", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Smith"
        })
        const response = await request(app).post(DIRECTOR_OCCUPATION_URL).send({"typeahead_input_0" : "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ"});

        expect(response.text).toContain("Occupation must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
        expect(response.text).toContain("John Smith");
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("should catch errors on submission if errors", async () => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
        const response = await request(app)
          .post(DIRECTOR_OCCUPATION_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });
      
    });

    describe("buildValidationErrors tests", () => {

    it("should return occupation validation error", async () => {
      const mockValidationStatusResponse: ValidationStatusResponse = {
        errors: [mockValidationStatusErrorOccupation],
        isValid: false
      }

      const validationErrors = buildValidationErrors(mockValidationStatusResponse);

      expect(validationErrors.map(error => error.messageKey)).toContain(occupationErrorMessageKey.OCCUPATION_LENGTH);
    });


  });

});
