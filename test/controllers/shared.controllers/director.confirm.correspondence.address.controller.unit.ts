jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  urlParams
} from "../../../src/types/page.urls";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Confirm the director&#39;s correspondence address";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
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


describe("Director confirm correspondence address controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
      mockGetCompanyAppointmentFullRecord.mockClear();
      mockPatchOfficerFiling.mockReset();
    });
  
    describe("get tests", () => {

      it.each([PAGE_URL,UPDATE_PAGE_URL])('should navigate to director confirm correspondence address page', async (url) => {
        if (url === UPDATE_PAGE_URL) {
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
            etag: "etag",
            forename: "John",
            otherForenames: "mid",
            surname: "Smith"
          });
        }

        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith"
        });

        const response = await request(app).get(url);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([PAGE_URL,UPDATE_PAGE_URL])("Should populate details on the page", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          name: "John Smith",
          serviceAddress: {
            premises: "110",
            addressLine1: "Test line 1",
            addressLine2: "Downing Street",
            locality: "Westminster",
            region: "London",
            country: "United Kingdom",
            postalCode: "SW1A 2AA"
          }
        });
        if (url === UPDATE_PAGE_URL) {
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({});
        }
        const response = await request(app).get(url);

        expect(response.text).toContain("110");
        expect(response.text).toContain("Test Line 1");
        expect(response.text).toContain("Downing Street");
        expect(response.text).toContain("Westminster");
        expect(response.text).toContain("London");
        expect(response.text).toContain("United Kingdom");
        expect(response.text).toContain("SW1A 2AA");
      });

      it.each([[PAGE_URL,DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH_END]])("Should navigate back button to search page", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
        });
        if (url === UPDATE_PAGE_URL) {
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({etag:"etagABC"});
        }
        const response = await request(app).get(url);
        expect(response.text).toContain(backLink);
      });

      it.each([PAGE_URL,UPDATE_PAGE_URL])('Should navigate to error page when feature flag is off', async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(url);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });
      
      it.each([PAGE_URL,UPDATE_PAGE_URL])('should catch error if getOfficerFiling error', async (url) => {
        const response = await request(app).get(url);
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it.each([PAGE_URL,UPDATE_PAGE_URL])('should populate backLink parameter', async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith"
        });
  
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain("backLink=confirm-correspondence-address");
      });
    });

    describe("post tests", () => {

      it.each([[PAGE_URL,DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL]])('Should redirect to residential address page', async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456"
        })
        
        if (url === UPDATE_PAGE_URL){
          mockGetCompanyAppointmentFullRecord.mockResolvedValue({
            etag: "etag2",
            serviceAddressIsSameAsRegisteredOfficeAddress: true
          });
        }
        const response = await request(app).post(url);
        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({correspondenceAddressHasBeenUpdated: true})
          );
        }
        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });
  
      it.each([[PAGE_URL,DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL]])('Should redirect to residential address page with correspondence address updated', async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        });

        if(url === UPDATE_PAGE_URL){
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
            serviceAddressIsSameAsRegisteredOfficeAddress: true
          });
        }

        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith",
            isServiceAddressSameAsRegisteredOfficeAddress: false
          }
        });
       
        const response = await request(app).post(url);
        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toBeCalledTimes(1);
          expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({correspondenceAddressHasBeenUpdated: true})
          );
        }
        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL,DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL]])('Should redirect to residential address page', async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        });
        if (url === UPDATE_PAGE_URL) {
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
            serviceAddressIsSameAsRegisteredOfficeAddress: true
          });
        }
        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith",
            isServiceAddressSameAsRegisteredOfficeAddress: true
          }
        });

        const response = await request(app).post(url);
        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toBeCalledTimes(1);
          expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({correspondenceAddressHasBeenUpdated: false})
          );
        }
        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL,DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL]])('Should redirect to residential address page with update flag true if different chips address', async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        });
        if (url === UPDATE_PAGE_URL) {
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
            serviceAddressIsSameAsRegisteredOfficeAddress: false
          });
        }
        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith",
            isServiceAddressSameAsRegisteredOfficeAddress: true
          }
        });
            
        const response = await request(app).post(url);
        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toBeCalledTimes(1);
          expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({correspondenceAddressHasBeenUpdated: true})
          );
        }
        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL,DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PAGE_URL]])('Should redirect to residential address page with update flag true if different chips address and different address', async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        });
        if (url === UPDATE_PAGE_URL) {
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
            serviceAddressIsSameAsRegisteredOfficeAddress: false
          });
        }
        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith",
            isServiceAddressSameAsRegisteredOfficeAddress: true
          }
        });
            
        const response = await request(app).post(url);
        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toBeCalledTimes(1);
          expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({correspondenceAddressHasBeenUpdated: true})
          );
        }
        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([PAGE_URL,UPDATE_PAGE_URL])('should catch error', async (url) => {
        mockPatchOfficerFiling.mockRejectedValue(new Error());
        if (url === UPDATE_PAGE_URL) {
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
            serviceAddressIsSameAsRegisteredOfficeAddress: false
          });
        }
        const response = await request(app).post(url);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([PAGE_URL, UPDATE_PAGE_URL])('should catch error when patching filing', async (url) => {
        mockPatchOfficerFiling.mockRejectedValue(new Error())       
        const resp = await request(app).post(url);
        expect(resp.text).toContain(ERROR_PAGE_HEADING)
        expect(mockPatchOfficerFiling).not.toHaveBeenCalled;
      });
    });
});
