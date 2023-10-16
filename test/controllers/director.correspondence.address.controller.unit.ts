jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_CORRESPONDENCE_ADDRESS, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH, urlParams } from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director's correspondence address?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PUBLIC_REGISTER_INFORMATION = "What information we'll show on the public online register";
const ACCORDION_INFORMATION = "We will not show your home address on the public register";
const PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const directorNameMock = {
  firstName: "John",
  middleName: "NewLand",
  lastName: "Doe"
}

const officerAddressMock = {
  registeredOfficeAddress: {
    premises: "The Big House",
    addressLine1: "One Street",
    addressLine2: "Two",
    locality: "Three",
    region: "Four",
    country: "Five",
    postalCode: "TE6 3ST"
  },
  serviceAddress: {}
}

const correspondenceAddressMock = {
  registeredOfficeAddress: {
  },
  serviceAddress: {
    premises: "The residential House",
    addressLine1: "residential Street",
    addressLine2: "residential two",
    locality: "residential Three",
    region: "Residential Four",
    country: "Residential country",
    postalCode: "RES 3AB"
  }
}

describe("Director correspondence address controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
    });
  
    describe("get tests", () => {
  
      it(`Should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} page`, async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock
        });
        const response = await request(app).get(PAGE_URL);
        // expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain(directorNameMock.firstName);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        expect(response.text).toContain(ACCORDION_INFORMATION);
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

      it(`should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} page with director registered officer address`, () => {

      });
    });

    describe("post tests", () => {

      it(`Should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} page if no radio button is selected`, async () => {
        const mockPatchOfficerFilingResponse = {
          data: {
            ...directorNameMock
          }
        };
       
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock,
          ...officerAddressMock
        });
        // mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
        const response = (await request(app).post(PAGE_URL).send({}));
        expect(response.text).toContain("Select the director’s correspondence address");
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        expect(response.text).toContain(directorNameMock.firstName);
        expect(mockGetOfficerFiling).toHaveBeenCalled();
        expect(response.text).toContain(officerAddressMock.registeredOfficeAddress.addressLine1);
        expect(response.text).not.toContain(officerAddressMock.registeredOfficeAddress.addressLine1);
        expect(response.text).not.toContain(officerAddressMock.registeredOfficeAddress.postalCode);
      });      
    });
});
