import {validCompanyEstablishedAfter2009Profile, validCompanyProfile} from "../mocks/company.profile.mock";

jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import * as apiEnumerations from "../../src/utils/api.enumerations";
import request from "supertest";
import app from "../../src/app";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { DIRECTOR_DATE_OF_CHANGE_PATH, UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from "../../src/types/page.urls";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const APPOINTMENT_ID = "987654321";


const PAGE_URL = DIRECTOR_DATE_OF_CHANGE_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = UPDATE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_HEADING = "When did the director&#39;s details change?";

describe("Director date details controller tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockPatchOfficerFiling.mockClear();
    mockGetCompanyProfile.mockResolvedValue(validCompanyEstablishedAfter2009Profile)
  });
          
    describe("GET tests", () => {
      it("Should navigate to director date of change page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({})
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain(PAGE_HEADING);
      });

      it("Should catch error if error occurred", async () => {
        mockGetOfficerFiling.mockRejectedValue("Error getting officer filing");
        const response = await request(app).get(PAGE_URL);
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });
    });

    describe("POST tests", () => {
      it("Should patch officer filing and redirect to check your answers", async () => {
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });
        const response = await request(app)
          .post(PAGE_URL)
          .send({
            "date_of_change-day": "10",
            "date_of_change-month": "09",
            "date_of_change-year": "2019" });

        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
          expect.anything(),
          expect.anything(),
          expect.anything(),
          expect.objectContaining({
            directorsDetailsChangedDate: "2019-09-10"
          })
        );
        expect(response.header.location).toEqual(NEXT_PAGE_URL);
      });

      it("Should display error before patching if date of change is in the future", async () => {
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });
        const year = new Date().getFullYear() + 1;
        const response = await request(app)
          .post(PAGE_URL)
          .send({
            "date_of_change-day": "10",
            "date_of_change-month": "09",
            "date_of_change-year": String(year) });

        expect(response.text).toContain("Enter a date that is today or in the past");
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("Should display error before patching if date of change before incorporation date", async () => {
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });
        const year = new Date().getFullYear() + 1;
        const response = await request(app)
          .post(PAGE_URL)
          .send({
            "date_of_change-day": "10",
            "date_of_change-month": "12",
            "date_of_change-year": "2009" });

        expect(response.text).toContain("Enter a date that is on or after the company&#39;s incorporation date");
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("Should display error before patching if date of change before 1 oct 2009", async () => {
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });
        const year = new Date().getFullYear() + 1;
        const response = await request(app)
          .post(PAGE_URL)
          .send({
            "date_of_change-day": "10",
            "date_of_change-month": "09",
            "date_of_change-year": "2008" });

        expect(response.text).toContain("Date the director’s details changed must be on or after 1 October 2009.");
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });

      it("Should display error before patching if date of change before appointment date", async () => {
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID,
          appointedOn: new Date("2015-10-10")
        });
        const year = new Date().getFullYear() + 1;
        const response = await request(app)
          .post(PAGE_URL)
          .send({
            "date_of_change-day": "10",
            "date_of_change-month": "09",
            "date_of_change-year": "2014" });

        expect(response.text).toContain("Enter a date that is on or after the date the director was appointed");
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });
    });
});