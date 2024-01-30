jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service")
jest.mock("../../../src/services/company.profile.service")

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import {
  urlParams,
  DIRECTOR_CORRESPONDENCE_ADDRESS, 
  DIRECTOR_OCCUPATION_PATH_END,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
} from '../../../src/types/page.urls';
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling } from "../../../src/services/officer.filing.service";
import { getCompanyProfile } from "../../../src/services/company.profile.service";
import { validCompanyProfile } from "../../mocks/company.profile.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director&#39;s correspondence address?";
const PUBLIC_REGISTER_INFORMATION = "What information we&#39;ll show on the public online register";
const ACCORDION_INFORMATION = "We will not show your home address on the public register";
const PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
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
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineTwo);
        expect(response.text).toContain("Locality");
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        expect(response.text).toContain(ACCORDION_INFORMATION);
        expect(response.text).toContain(DIRECTOR_OCCUPATION_PATH_END);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
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
        expect(response.text).toContain("Locality");
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });
      
    });
});
