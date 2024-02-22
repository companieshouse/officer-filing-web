jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service")
jest.mock("../../../src/services/company.profile.service")
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import {
  urlParams,
  DIRECTOR_CORRESPONDENCE_ADDRESS,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_OCCUPATION_PATH_END,
  DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS,
  UPDATE_DIRECTOR_DETAILS_END,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH
} from '../../../src/types/page.urls';
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../../../src/services/company.profile.service";
import { validCompanyProfile, validAddress } from "../../mocks/company.profile.mock";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { validCompanyAppointmentResource } from "../../mocks/company.appointment.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockMapCompanyProfileToOfficerFilingAddressMock = mapCompanyProfileToOfficerFilingAddress as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointmentResource.resource);

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "What is the director&#39;s correspondence address?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PUBLIC_REGISTER_INFORMATION = "What information we&#39;ll show on the public online register";
const ACCORDION_INFORMATION = "We will not show your home address on the public register";
const PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_CORRESPONDENCE_LINK_PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const UPDATE_DIRECTOR_CORRESPONDENCE_LINK_PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PAGE_PATH = DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PAGE_PATH = UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH
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
      it.each([[PAGE_URL,DIRECTOR_OCCUPATION_PATH_END],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_DETAILS_END,]])(`Should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} and ${UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS} page`, async (url, backLink) => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock
        });
        const response = await request(app).get(url);
        expect(response.text).toContain(PAGE_HEADING);
        if(url == PAGE_URL) {
          // from officer filing
          expect(response.text).toContain("John Doe");
        } else {
          // from company appointment
          expect(response.text).toContain("John Elizabeth Doe");
        }
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineTwo);
        expect(response.text).toContain("Locality");
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        expect(response.text).toContain(ACCORDION_INFORMATION);
        expect(response.text).toContain(backLink);
        
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL,DIRECTOR_OCCUPATION_PATH_END],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_DETAILS_END]])(`Should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} and ${UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS} page without address line 2`, async (url, backLink) => {
        validCompanyProfile.registeredOfficeAddress.addressLineTwo = undefined!;
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock
        });
        const response = await request(app).get(url);
        expect(response.text).toContain(PAGE_HEADING);
        if(url == PAGE_URL) {
          // from officer filing
          expect(response.text).toContain("John Doe");
        } else {
          // from company appointment
          expect(response.text).toContain("John Elizabeth Doe");
        }
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
        expect(response.text).not.toContain("Line2");
        expect(response.text).toContain("Locality");
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        expect(response.text).toContain(ACCORDION_INFORMATION);
        expect(response.text).toContain(backLink);

      });

      it.each([PAGE_URL,UPDATE_PAGE_URL])("Should navigate to error page when feature flag is off", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([PAGE_URL,UPDATE_PAGE_URL])("should catch error if getofficerfiling error", async (url) => {
        mockGetOfficerFiling.mockRejectedValue("Error getting officer filing");
        const response = await request(app).get(url);
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });
      
      it.each([[PAGE_URL,DIRECTOR_OCCUPATION_PATH_END],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_DETAILS_END]])(`should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} and ${UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS} with mapped registered office address `, async (url, backLink) => {
        mockGetCompanyProfile.mockResolvedValue({});
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock
        });
        const response = await request(app).get(url);
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
        expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.locality);
        expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        expect(response.text).toContain(ACCORDION_INFORMATION);
        expect(response.text).toContain(backLink);

      })
    });

    describe("post tests", () => {
      it.each([PAGE_URL,UPDATE_PAGE_URL])(`Should render ${DIRECTOR_CORRESPONDENCE_ADDRESS} and ${UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS} page if no radio button is selected`, async (url) => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock,
        });
        const response = (await request(app).post(url).send({}));
        expect(response.text).toContain("Select the director’s correspondence address");
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
        if(url == PAGE_URL) {
          // from officer filing
          expect(response.text).toContain("John Doe");
        } else {
          // from company appointment
          expect(response.text).toContain("John Elizabeth Doe");
        }
        expect(mockGetOfficerFiling).toHaveBeenCalled();
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
        expect(response.text).toContain("Locality");
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
        expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });
      
      it.each([PAGE_URL,UPDATE_PAGE_URL])("should catch error if patch officer filing failed", async (url) => {
        const response = (await request(app).post(url).send({}));
        expect(response.text).not.toContain("Select the director’s correspondence address");
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it.each([[PAGE_URL,DIRECTOR_CORRESPONDENCE_LINK_PAGE_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_CORRESPONDENCE_LINK_PAGE_URL]])(`should redirect to ${DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH} or ${UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH} if registered office address is selected`, async (url,redirectLink) => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockMapCompanyProfileToOfficerFilingAddressMock.mockReturnValueOnce(validAddress);
        mockPatchOfficerFiling.mockResolvedValueOnce({data: {
          isHomeAddressSameAsServiceAddress: undefined
        }});
        if (url === UPDATE_PAGE_URL) {
          mockGetOfficerFiling.mockResolvedValueOnce({
          });
        }
        const response = (await request(app).post(url).send({
          director_correspondence_address: "director_registered_office_address"
        }));
        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({correspondenceAddressHasBeenUpdated: true})
          );
        }
        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });

      it.each([[PAGE_URL, DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PAGE_PATH],[UPDATE_PAGE_URL, UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PAGE_PATH] ])
      (`should redirect to link to incomplete address page if registered office address is selected but the address is incomplete`, async (url, nextPageUrl) => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockMapCompanyProfileToOfficerFilingAddressMock.mockReturnValueOnce({ ...validAddress, premises: undefined});
        mockPatchOfficerFiling.mockResolvedValueOnce({data: {
          isHomeAddressSameAsServiceAddress: undefined
        }});
        const response = (await request(app).post(url).send({
          director_correspondence_address: "director_registered_office_address"
        }));
        expect(response.status).toEqual(302);
        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
      });

      it.each([[PAGE_URL,DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL]])(`should redirect to ${DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL} or ${UPDATE_DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL} if different address is selected`, async (url,redirectLink) => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockMapCompanyProfileToOfficerFilingAddressMock.mockReturnValueOnce(validAddress);
        mockPatchOfficerFiling.mockResolvedValueOnce({data: {
          isHomeAddressSameAsServiceAddress: undefined
        }});
        const response = (await request(app).post(url).send({
          director_correspondence_address: "director_different_address"
        }));
        expect(response.status).toEqual(302);
        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });

      it.each([[PAGE_URL,DIRECTOR_CORRESPONDENCE_LINK_PAGE_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_CORRESPONDENCE_LINK_PAGE_URL]])(`should patch the service address with no registered office address if selected`, async (url, redirectLink) => {
        mockPatchOfficerFiling.mockResolvedValueOnce({data: {
          isHomeAddressSameAsServiceAddress: false
        }});
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockMapCompanyProfileToOfficerFilingAddressMock.mockReturnValueOnce(validAddress);
        if (url === UPDATE_PAGE_URL) {
          mockGetOfficerFiling.mockResolvedValueOnce({ referenceAppointmentId: "1234" });
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          });
        }

        const response = (await request(app).post(url).send({
          director_correspondence_address: "director_registered_office_address"
        }));
       
        expect(response.status).toEqual(302);
        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });

      it.each([[PAGE_URL,DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL]])(`should redirect to ${DIRECTOR_CORRESPONDENCE_ADDRESS} or ${UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS} if office address is selected and home address flag is already set`, async (url, redirectLink) => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        mockMapCompanyProfileToOfficerFilingAddressMock.mockReturnValueOnce(validAddress);
        mockPatchOfficerFiling.mockResolvedValueOnce({data: {
          isHomeAddressSameAsServiceAddress: true
        }});
        if (url === UPDATE_PAGE_URL) {
          mockGetOfficerFiling.mockResolvedValueOnce({ referenceAppointmentId: "1234" });
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          });
        }
        const response = (await request(app).post(url).send({
          director_correspondence_address: "director_registered_office_address"
        }));
        expect(response.status).toEqual(302);
        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });
    });
});
