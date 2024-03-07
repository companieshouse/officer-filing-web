jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");
jest.mock("../../../src/utils/address");
jest.mock("../../../src/utils/is.address.updated");


import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import {
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
  CHECK_YOUR_ANSWERS_PATH_END,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
  UPDATE_DIRECTOR_CHECK_ANSWERS_PATH,
  UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_DETAILS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END,
  urlParams
} from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { compareAddress } from "../../../src/utils/address";
import { checkIsResidentialAddressUpdated } from "../../../src/utils/is.address.updated";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
const mockCompareAddress = compareAddress as jest.Mock;
const mockCheckIsResidentialAddress = checkIsResidentialAddressUpdated as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Confirm where the director lives";
const PAGE_HEADING_WELSH = "Cadarnhewch ble mae&#39;r cyfarwyddwr yn byw";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const APPOINT_PAGE_URL = DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = DIRECTOR_PROTECTED_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_NEXT_PAGE_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const APPOINT_DIRECTOR_CHECK_ANSWERS_URL = APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_DIRECTOR_CHECK_ANSWERS_URL = UPDATE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director confirm residential address controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockReset();
      mockGetCompanyAppointmentFullRecord.mockClear();
      mockPatchOfficerFiling.mockReset();
      mockCompareAddress.mockClear();
    });
  
    describe("get tests", () => {
      it.each([[APPOINT_PAGE_URL], [UPDATE_PAGE_URL]])("Should navigate to '%s' page", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith"
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});

        const response = await request(app).get(url);
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[APPOINT_PAGE_URL], [UPDATE_PAGE_URL]])("Should populate details on the page", async (url) => {
        mockGetOfficerFiling.mockResolvedValue({
          name: "John Smith",
          residentialAddress: {
            premises: "110",
            addressLine1: "Test line 1",
            addressLine2: "Downing Street",
            locality: "Westminster",
            region: "London",
            country: "United Kingdom",
            postalCode: "SW1A 2AA"
          }
        })

        mockGetCompanyAppointmentFullRecord.mockResolvedValue({
          name: "John Smith",
          residentialAddress: {
            premises: "110",
            addressLine1: "Test line 1",
            addressLine2: "Downing Street",
            locality: "Westminster",
            region: "London",
            country: "United Kingdom",
            postalCode: "SW1A 2AA"
          }
        });
        
        const response = await request(app).get(url);
        expect(response.text).toContain("John Smith");
        expect(response.text).toContain("110");
        expect(response.text).toContain("Test Line 1");
        expect(response.text).toContain("Downing Street");
        expect(response.text).toContain("Westminster");
        expect(response.text).toContain("London");
        expect(response.text).toContain("United Kingdom");
        expect(response.text).toContain("SW1A 2AA");
      });

      it.each([[APPOINT_PAGE_URL, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END], [UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END]])("Should navigate back button to search page if officerFiling.residentialAddressBackLink includes DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          residentialAddressBackLink: backLink
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});
        const response = await request(app).get(url);

        expect(response.text).toContain(backLink);
      });

      it.each([[APPOINT_PAGE_URL, DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END], [UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH_END]])
      ("Should navigate back button to search page if officerFiling.residentialAddressBackLink includes DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          residentialAddressBackLink: backLink
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});
        const response = await request(app).get(url+"?lang=cy");

        expect(response.text).toContain(PAGE_HEADING_WELSH);
      });

      it.each([[APPOINT_PAGE_URL, DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END], [UPDATE_PAGE_URL, UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END]])("Should navigate back button to choose address array page if officerFiling.residentialAddressBackLink includes DIRECTOR_RESIDENTIAL_ADDRESS_MANUAL_PATH_END", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith",
          residentialAddressBackLink: backLink
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});
        const response = await request(app).get(url);

        expect(response.text).toContain(backLink);
      });

      it.each([[APPOINT_PAGE_URL], [UPDATE_PAGE_URL]])("Should navigate to error page when feature flag is off", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        mockGetOfficerFiling.mockRejectedValue({});
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[APPOINT_PAGE_URL], [UPDATE_PAGE_URL]])("should catch error if getofficerfiling error", async (url) => {
        const response = await request(app).get(url);
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it.each([[APPOINT_PAGE_URL], [UPDATE_PAGE_URL]])("should populate backLink parameter", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "John Smith"
        })
        const response = await request(app).get(url);
        expect(response.text).toContain("backLink=confirm-residential-address");
      });
    });

    describe("post tests", () => {
  
      it.each([[APPOINT_PAGE_URL, NEXT_PAGE_URL], [UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("Should redirect to '%s' page", async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockReturnValueOnce({referenceAppointmentId: "123" });
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});
       
        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith",
            isHomeAddressSameAsServiceAddress: false
          }
        });
        mockCheckIsResidentialAddress.mockReturnValue(true);

        const response = await request(app).post(url);
        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toBeCalledTimes(1);
          expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({residentialAddressHasBeenUpdated: true})
          );
        }
        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[APPOINT_PAGE_URL, NEXT_PAGE_URL], [UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("Should redirect to '%s' page without update flag", async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockReturnValueOnce({
          isHomeAddressSameAsServiceAddress: true,
          checkYourAnswersLink: undefined
        });
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          residentialAddressIsSameAsServiceAddress: true
        });

        mockPatchOfficerFiling.mockResolvedValueOnce({
          data: {
            firstName: "John",
            lastName: "Smith",
            isHomeAddressSameAsServiceAddress: true
          }
        });
        mockCheckIsResidentialAddress.mockReturnValue(false);
        const response = await request(app).post(url);
        if (url === UPDATE_PAGE_URL) {
          expect(mockPatchOfficerFiling).toBeCalledTimes(1);
          expect(mockPatchOfficerFiling).toHaveBeenCalledWith(
            expect.objectContaining({}),
            TRANSACTION_ID,
            SUBMISSION_ID,
            expect.objectContaining({residentialAddressHasBeenUpdated: false})
          );
        }
        expect(response.text).toContain("Found. Redirecting to " + nextPageUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[APPOINT_PAGE_URL, APPOINT_DIRECTOR_CHECK_ANSWERS_URL], [UPDATE_PAGE_URL, UPDATE_DIRECTOR_CHECK_ANSWERS_URL]])("Should redirect to check your answer page if filing has check your answers link", async (url, checkYourAnswerUrl) => {
        mockGetOfficerFiling.mockReturnValueOnce({
          referenceAppointmentId: "123",
          checkYourAnswersLink: CHECK_YOUR_ANSWERS_PATH_END
        });
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});
        const response = await request(app).post(url);

        expect(response.text).toContain("Found. Redirecting to " + checkYourAnswerUrl);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[APPOINT_PAGE_URL], [UPDATE_PAGE_URL]])("should catch error", async (url) => {
        mockGetOfficerFiling.mockReturnValueOnce({referenceAppointmentId: "123"});
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});
        mockPatchOfficerFiling.mockRejectedValue(new Error())       
        const response = await request(app).post(url);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      }); 
  
      it.each([[APPOINT_PAGE_URL], [UPDATE_PAGE_URL]])("should set home address same as service address to false", async (url) => {
        mockGetOfficerFiling.mockReturnValueOnce({referenceAppointmentId: "123"});
        mockGetCompanyAppointmentFullRecord.mockResolvedValue({});
        mockPatchOfficerFiling.mockReturnValueOnce({
          data: {
            isHomeAddressSameAsServiceAddress: false
          }
        });
        const response = await request(app).post(url);
        
        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, expect.objectContaining({
          isHomeAddressSameAsServiceAddress: false
        }));
      });
    });
});
