jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service")
jest.mock("../../src/services/company.profile.service")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_CORRESPONDENCE_ADDRESS, 
         DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, 
         DIRECTOR_PROTECTED_DETAILS_PATH, urlParams, DIRECTOR_OCCUPATION_PATH_END } 
         from '../../src/types/page.urls';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director&#39;s correspondence address?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PUBLIC_REGISTER_INFORMATION = "What information we'll show on the public online register";
const ACCORDION_INFORMATION = "We will not show your home address on the public register";
const PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_PROTECTED_INFORMATION_PAGE_URL = DIRECTOR_PROTECTED_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const directorNameMock = {
  firstName: "John",
  middleName: "NewLand",
  lastName: "Doe"
}

describe("Director correspondence address controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
    });
  
    describe("get tests", () => {
  
      it(`Should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} page`, async () => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock
        });
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain(directorNameMock.firstName);
              expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.locality);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        expect(response.text).toContain(ACCORDION_INFORMATION);
        expect(response.text).toContain(DIRECTOR_OCCUPATION_PATH_END)
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("should catch error if getofficerfiling error", async () => {
        mockGetOfficerFiling.mockRejectedValue("Error getting officer filing");
        const response = await request(app).get(PAGE_URL);
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });
    });

    describe("post tests", () => {

      it(`Should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} page if no radio button is selected`, async () => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock,
        });
        const response = (await request(app).post(PAGE_URL).send({}));
        expect(response.text).toContain("Select the director’s correspondence address");
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        expect(response.text).toContain(directorNameMock.firstName);
        expect(mockGetOfficerFiling).toHaveBeenCalled();
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.locality);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      });
      
      it("should catch error if patch officer filing failed", async () => {
        const mockPatchOfficerFilingResponse = {
        };
        mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
        const response = (await request(app).post(PAGE_URL).send({}));
        expect(response.text).not.toContain("Select the director’s correspondence address");
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it(`should redirect to ${DIRECTOR_PROTECTED_DETAILS_PATH} if registered office address is selected`, async () => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock,
        });
        const response = (await request(app).post(PAGE_URL).send({
          director_correspondence_address: "director_registered_office_address"
        }));
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_PROTECTED_INFORMATION_PAGE_URL);
      });

      it(`should redirect to ${DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH} if different address is selected`, async () => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock,
        });
        const response = (await request(app).post(PAGE_URL).send({
          director_correspondence_address: "director_different_address"
        }));
        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL);
      });

      it(`should patch the service address with no registered office address if selected`, async () => {
        mockGetCompanyProfile.mockResolvedValue({});
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock,
        });
        const response = (await request(app).post(PAGE_URL).send({
          director_correspondence_address: "director_registered_office_address"
        }));

        expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_PROTECTED_INFORMATION_PAGE_URL);
      });
    });
});
