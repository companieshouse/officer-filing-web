jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/stop.page.validation.service");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/validation.status.service");
jest.mock("../../src/services/transaction.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, APPOINT_DIRECTOR_SUBMITTED_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getCurrentOrFutureDissolved } from "../../src/services/stop.page.validation.service";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { mockAddress1 } from '../mocks/remove.director.check.answers.mock';
import { getValidationStatus } from "../../src/services/validation.status.service";
import { closeTransaction } from "../../src/services/transaction.service";
import { mockValidValidationStatusResponse, mockValidationStatusResponse } from "../mocks/validation.status.response.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetCurrentOrFutureDissolved = getCurrentOrFutureDissolved as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
const mockGetValidationStatus = getValidationStatus as jest.Mock;
const mockCloseTransaction = closeTransaction as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Check your answers before submitting the appointment";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = APPOINT_DIRECTOR_SUBMITTED_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Appoint director check answers controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
    });
  
    describe("get tests", () => {
  
      it.each([[true, "Yes"],[false, "No"]])("Should navigate to the appoint director check answers page", async (appliedToProtectDetails, protectedDetailsString) => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
          firstName: "John",
          lastName: "Doe",
          title: "Mr",
          formerNames: "James",
          occupation: "Director",
          dateOfBirth: "1990-01-01",
          appointedOn: "2020-01-01",
          directorAppliedToProtectDetails: appliedToProtectDetails
        }});
        const response = await request(app).get(PAGE_URL);
  
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain("John");
        expect(response.text).toContain("Doe");
        expect(response.text).toContain("James");
        expect(response.text).toContain("Mr");
        expect(response.text).toContain("Director");
        expect(response.text).toContain("1 January 1990");
        expect(response.text).toContain("1 January 2020");
        expect(response.text).toContain(protectedDetailsString + '\n')
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
      });

      it("Should navigate to the appoint director check answers page in welsh", async () => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
          firstName: "John",
          lastName: "Doe",
          title: "Mr",
          formerNames: "James",
          occupation: "Director",
          dateOfBirth: "1990-01-01",
          appointedOn: "2020-01-01",
        }});
        const response = await request(app).get(PAGE_URL + "?lang=cy");
  
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Gwiriwch eich atebion cyn cyflwyno&#39;r penodiad");
        expect(response.text).toContain("1 Ionawr 1990");
        expect(response.text).toContain("1 Ionawr 2020");
        expect(response.text).toContain("A yw&#39;r cyfarwyddwr wedi gwneud cais i ddiogelu eu manylion yn Nhŷ&#39;r Cwmnïau?");
        expect(response.text).toContain("Cydsynio i weithredu fel cyfarwyddwr");
        expect(response.text).toContain("Trwy gyflwyno&#39;r wybodaeth hon, rydych yn cadarnhau bod y person a enwir wedi cydsynio i weithredu fel cyfarwyddwr.");
        expect(mockPatchOfficerFiling).toHaveBeenCalled();
      });

      it("should display address details section with correspondence address if not linked", async () => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
          firstName: "John",
          lastName: "Doe",
          formerNames: "James",
          occupation: "Director",
          dateOfBirth: "1990-01-01",
          appointedOn: "2020-01-01",
          serviceAddress: mockAddress1,
          isServiceAddressSameAsRegisteredOfficeAddress: false
        }});
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain("Diddly Squat Farm Shop"),
        expect(response.text).toContain(mockAddress1.postalCode),
        expect(response.text).not.toContain("The correspondence address is the same as the registered office address");
      });

      it("should display address details section correspondence address with same as address text if linked", async () => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
          firstName: "John",
          lastName: "Doe",
          formerNames: "James",
          occupation: "Director",
          dateOfBirth: "1990-01-01",
          appointedOn: "2020-01-01",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        }});
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain("The correspondence address is the same as the registered office address");
      });

      it("should display address details section home address with same as address text if linked", async () => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
          firstName: "John",
          lastName: "Doe",
          formerNames: "James",
          occupation: "Director",
          dateOfBirth: "1990-01-01",
          appointedOn: "2020-01-01",
          isHomeAddressSameAsServiceAddress: true
        }});
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain("The home address is the same as the correspondence address");
      });

      it("should display address details section home address value if not linked", async () => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
          firstName: "John",
          lastName: "Doe",
          formerNames: "James",
          occupation: "Director",
          dateOfBirth: "1990-01-01",
          appointedOn: "2020-01-01",
          residentialAddress: mockAddress1,
          isHomeAddressSameAsServiceAddress: false
        }});
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain("Diddly Squat Farm Shop"),
        expect(response.text).toContain(mockAddress1.postalCode),
        expect(response.text).not.toContain("The home address is the same as the correspondence address");
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {
  
      it("Should redirect to appoint director submitted page", async () => {
        mockGetCurrentOrFutureDissolved.mockResolvedValueOnce(false);
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        const response = (await request(app).post(PAGE_URL).send({"director_consent": "director_consent"}));

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
      });

      it("Should redirect to dissolved stop page if company was dissolved", async () => {
        mockGetCurrentOrFutureDissolved.mockReturnValueOnce(true);
        const response = (await request(app).post(PAGE_URL).send({"director_consent": "director_consent"}));
        expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=dissolved");
      });

      it("Should raise an error if the director consent box is not ticked", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          firstName: "John",
          lastName: "Doe",
          formerNames: "James",
          occupation: "Director",
          dateOfBirth: "1990-01-01",
          appointedOn: "2020-01-01"
        });
        mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);
        const response = (await request(app).post(PAGE_URL));

        expect(response.text).toContain("Select if you confirm that by submitting this information, the person named has consented to act as director");
      });

      it("Should redirect to error 500 screen if close transaction returns errors", async () => {
        mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);
        mockGetValidationStatus.mockResolvedValueOnce(mockValidValidationStatusResponse);
        mockCloseTransaction.mockRejectedValue(new Error("can't connect"));

        const response = await request(app)
          .post(PAGE_URL)
          .send({"director_consent": "director_consent"});

        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(mockCloseTransaction).toHaveBeenCalled();
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should redirect to something-went-wrong stop screen if there are any validation errors", async () => {
        mockGetCurrentOrFutureDissolved.mockReturnValueOnce(false);
        mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatusResponse);
        mockCloseTransaction.mockRejectedValue(new Error("can't connect"));

        const response = await request(app)
          .post(PAGE_URL)
          .send({"director_consent": "director_consent"});

        expect(mockGetValidationStatus).toHaveBeenCalled();
        expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=something-went-wrong");
      });
      
    });

});
