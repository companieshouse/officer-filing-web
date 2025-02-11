jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/company.profile.service");
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");


import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { DIRECTOR_DATE_OF_CHANGE_PATH, UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from "../../../src/types/page.urls";
import { validCompanyEstablishedAfter2009Profile } from "../../mocks/company.profile.mock";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const APPOINTMENT_ID = "987654321";


const PAGE_URL = DIRECTOR_DATE_OF_CHANGE_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const PAGE_URL_WELSH = PAGE_URL + "?lang=cy";
const NEXT_PAGE_URL = UPDATE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID) + "?lang=en";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_HEADING = "When did the director&#39;s details change?";
const PAGE_HEADING_WELSH = "Pryd newidiodd manylion y cyfarwyddwr?"

describe("Director date of change controller tests", () => {

  beforeEach(() => {
    mocks.mockCreateSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockPatchOfficerFiling.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
    mockGetCompanyProfile.mockResolvedValue(validCompanyEstablishedAfter2009Profile)
  });
          
    describe("GET tests", () => {
      it("Should navigate to director date of change page", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({
          etag: "etag",
          forename: "John",
          otherForenames: "mid",
          surname: "Smith"
        });
    
        mockGetOfficerFiling.mockResolvedValueOnce({})
    
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("John Mid Smith");
        expect(response.text).not.toContain("update-director-check-answers");

      });

      it("Should navigate to director date of change page in Welsh", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({
          etag: "etag",
          forename: "John",
          otherForenames: "mid",
          surname: "Smith"
        });
    
        mockGetOfficerFiling.mockResolvedValueOnce({})
    
        const response = await request(app).get(PAGE_URL_WELSH);
        expect(response.text).toContain(PAGE_HEADING_WELSH);
        expect(response.text).toContain("John Mid Smith");
        expect(response.text).not.toContain("update-director-check-answers");

      });

      it("Should populate backlink as check your answers path if flag is true", async () => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({
          etag: "etag",
          forename: "John",
          otherForenames: "mid",
          surname: "Smith"
        });
    
        mockGetOfficerFiling.mockResolvedValueOnce({
          checkYourAnswersLink: "update-director-check-answers"
        })
  
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("John Mid Smith");
        expect(response.text).toContain("update-director-check-answers");
      });

      it("Should catch error if error occurred", async () => {
        mockGetOfficerFiling.mockRejectedValue("Error getting officer filing");
        const response = await request(app).get(PAGE_URL);
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it('should set checkYourAnswersLink to empty string if ?cya_backlink=true', async () => {
        mockGetOfficerFiling.mockResolvedValue({});
        mockPatchOfficerFiling.mockResolvedValue({data:{
          firstName: "John",
          lastName: "Doe",
          checkYourAnswersLink: ""
        }});
        const response = await request(app).get(PAGE_URL + "?cya_backlink=true");
        expect(patchOfficerFiling).toHaveBeenCalled();
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

        expect(response.text).toContain("Date the director’s details changed must be on or after 1 October 2009");
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

      it("Should display error before patching if date of change does not include month and year", async () => {
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: APPOINTMENT_ID
        });
        const response = await request(app)
          .post(PAGE_URL)
          .send({
            "date_of_change-day": "10",
            "date_of_change-month": "",
            "date_of_change-year": "" });

        expect(response.text).toContain("Date the director’s details changed must include a month and year");
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      });
    });
});