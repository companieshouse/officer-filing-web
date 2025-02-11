import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";

jest.mock("../../../src/utils/feature.flag");
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.profile.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";

import { 
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH, 
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  urlParams,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_CHECK_ANSWERS_PATH,
  UPDATE_DIRECTOR_CHECK_ANSWERS_END,
  UPDATE_DIRECTOR_DETAILS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH
} from '../../../src/types/page.urls';
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../../../src/services/company.profile.service";
import { validCompanyProfile, validAddress } from "../../mocks/company.profile.mock";
import { whereDirectorLiveResidentialErrorMessageKey } from "../../../src/utils/api.enumerations.keys";
import { validCompanyAppointmentResource } from "../../mocks/company.appointment.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockMapCompanyProfileToOfficerFilingAddress = mapCompanyProfileToOfficerFilingAddress as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointmentResource.resource);

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Where does the director live?";
const PUBLIC_REGISTER_INFORMATION = "What information we&#39;ll show on the public online register";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_PROTECTED_INFORMATION_PAGE_URL = DIRECTOR_PROTECTED_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const DIRECTOR_RESIDENTIAL_ADDRESS_LINK_URL = DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const APPOINT_DIRECTOR_CYA_PAGE_URL = APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const UPDATE_DIRECTOR_CYA_PAGE_URL = UPDATE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PAGE_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const UPDATE_DIRECTOR_DETAILS_PAGE_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PAGE_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const mockReq = {
  session: {} as Session,
  headers: {},
  route: '',
  method: '',
  body: {},
} as Request;

const directorNameMock = {
  firstName: "John",
  middleName: "NewLand",
  lastName: "Doe"
}

const serviceAddressMock = {
  serviceAddress: {
    premises: "The Big House",
    addressLine1: "One Street",
    addressLine2: "Two",
    locality: "Three",
    region: "Four",
    country: "Five",
    postalCode: "TE6 3ST"
  },
}

describe("Director name controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mocks.mockCreateSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockReset();
    mockGetCompanyProfile.mockReset();
    mockPatchOfficerFiling.mockReset();
    mockMapCompanyProfileToOfficerFilingAddress.mockReset();
  });

  describe("get tests", () => {
    it("Should navigate to director address page", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineTwo);
      expect(response.text).toContain("Locality");
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should navigate to director address page with welsh language", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(PAGE_URL+"?lang=cy");
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineTwo);
      expect(response.text).toContain("Locality");
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain("Ble mae’r cyfarwyddwr yn byw?");
      expect(response.text).toContain("Dyma gyfeiriad swyddfa gofrestredig y cwmni");
      expect(response.text).toContain("Cyfeiriad gwahanol");
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])("Should navigate to error page when feature flag is off", async (url) => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(url);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page with director registered office address`, async (url) => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(url);
      expect(response.text).toContain(PAGE_HEADING);
      if(url == PAGE_URL) {
        // from filing
        expect(response.text).toContain("John Doe");
      } else {
        // from company appointment
        expect(response.text).toContain("John Elizabeth Doe")
      }
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
      expect(response.text).toContain("Premises");
      expect(response.text).toContain(
        serviceAddressMock.serviceAddress.premises + ", " 
        + serviceAddressMock.serviceAddress.addressLine1 + ", " 
        + serviceAddressMock.serviceAddress.addressLine2 + ", " 
        + serviceAddressMock.serviceAddress.locality + ", " 
        + serviceAddressMock.serviceAddress.region + ", " 
        + serviceAddressMock.serviceAddress.country + ", " 
        + serviceAddressMock.serviceAddress.postalCode
      );
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page with without director registered office address when that address is incomplete`, async (url) => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      const invalidAddress = { ...validAddress, premises: undefined };
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(invalidAddress);
      const response = await request(app).get(url);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.premises);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine2);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.region);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.country);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.postalCode);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without director registered office address when it was selected as correspondence address`, async (url) => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
        directorServiceAddressChoice: "director_registered_office_address"
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(url);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).not.toContain("This is the company's registered office address");
      expect(response.text).toContain(serviceAddressMock.serviceAddress.premises);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine2);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.region);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.country);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.postalCode);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without director registered office address line 2 `, async (url) => {
      validCompanyProfile.registeredOfficeAddress.addressLineTwo = undefined!;
      validCompanyProfile.registeredOfficeAddress.premises = undefined!;
      validCompanyProfile.registeredOfficeAddress.region = undefined!;
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(url);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).not.toContain("Line2");
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.postalCode);
      expect(response.text).not.toContain("Premises");
      expect(response.text).not.toContain("Region");
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without optional field for director residential address `, async (url) => {
      serviceAddressMock.serviceAddress.addressLine2 = undefined!;
      serviceAddressMock.serviceAddress.premises = undefined!;
      serviceAddressMock.serviceAddress.region = undefined!;
      serviceAddressMock.serviceAddress.country = undefined!;
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(url);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.postalCode);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.locality);
      expect(response.text).not.toContain("Two");
      expect(response.text).not.toContain("The Big House");
      expect(response.text).not.toContain("Five");
      expect(response.text).not.toContain("Four");
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without director registered office address`, async (url) => {
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(url);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without director correspondence address`, async (url) => {
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(url);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.postalCode);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])("should catch error if getofficerfiling error", async (url) => {
      const response = await request(app).get(url);
      mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render address with correct capitalisations on page %p`, async (url) => {
      const mockAddress = {
        serviceAddress: {
          premises: "the big house",
          addressLine1: "one street",
          addressLine2: "two",
          locality: "THREE",
          region: "FouR",
          country: "FIVe",
          postalCode: "te6 3st"
        },
      }
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...mockAddress
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = await request(app).get(url);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain("The Big House, One Street, Two, Three, Four, Five, TE6 3ST");
    });
  });

  describe("post tests", () => {
    it.each([PAGE_URL, UPDATE_PAGE_URL])(`Should render where director lives page if no radio button is selected`, async (url) => {
      const mockPatchOfficerFilingResponse = {
        data: {
          ...directorNameMock
        }
      };
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
      });
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      const response = (await request(app).post(url).send({}));
      expect(response.text).toContain("Select the address where the director lives");
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(mockGetOfficerFiling).toHaveBeenCalled();
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.postalCode);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])("should catch error if patch officer filing failed", async (url) => {
      const mockPatchOfficerFilingResponse = {
      };
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(url).send({}));
      expect(response.text).not.toContain("Select the address where the director lives");
      expect(response.text).not.toContain(PAGE_HEADING);
      expect(response.text).toContain(ERROR_PAGE_HEADING)
    });

    it.each([[PAGE_URL,DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PAGE_URL]])(`should redirect to ${DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH} or ${UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH} page if different address is selected`, async (url, redirectLink) => {
      const mockPatchOfficerFilingResponse = {
        directorResidentialAddressChoice: "different_address",
      };
      mockGetOfficerFiling.mockReturnValueOnce({
        
      });
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(url).send({ director_address: "director_different_address" }));
      expect(response.text).toContain("Found. Redirecting to " + redirectLink);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should redirect to ${DIRECTOR_PROTECTED_DETAILS_PATH} page if registered office address is selected`, async (url) => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      const mockPatchOfficerFilingResponse = {
        data: {
          ...directorNameMock,
        }
      };
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(url).send({
        director_address: "director_registered_office_address"
      }))
    });

    it.each([[PAGE_URL,APPOINT_DIRECTOR_CYA_PAGE_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_CYA_PAGE_URL]])(`should redirect to ${APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END} or ${UPDATE_DIRECTOR_CHECK_ANSWERS_END} page if registered office address is selected and CYA link exist`, async (url, redirectLink) => {
        mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
        const mockPatchOfficerFilingResponse = {
          data: {
            ...directorNameMock,
            checkYourAnswersLink: "/check-your-answer"
          }
        };
        mockGetOfficerFiling.mockResolvedValueOnce({
          ...directorNameMock,
          ...serviceAddressMock
        });
        mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
        const response = (await request(app).post(url).send({
          director_address: "director_registered_office_address"
        }));

      expect(response.text).toContain("Found. Redirecting to " + redirectLink);
    });

    it.each([[PAGE_URL,APPOINT_DIRECTOR_CYA_PAGE_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_CYA_PAGE_URL]])(`should redirect to ${APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END} or ${UPDATE_DIRECTOR_CHECK_ANSWERS_END} page if registered office address is selected and check your answers link`, async (url, redirectLink) => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      const mockPatchOfficerFilingResponse = {
        data: {
          ...directorNameMock,
          checkYourAnswersLink: "/check-your-answer"
        }
      };
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(url).send({
        director_address: "director_registered_office_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + redirectLink);
    });

    it(`should patch the residential address if no registered office address and redirect to protected information page if AP01`, async () => {
      mockGetCompanyProfile.mockResolvedValue({});
      const mockPatchOfficerFilingResponse = {
        data: {
          ...directorNameMock,
        }
      };
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_registered_office_address",
      }));

      expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_PROTECTED_INFORMATION_PAGE_URL);
    });

    it(`should patch the residential address if no registered office address and redirect to update director details page if CH01`, async () => {
      mockGetCompanyProfile.mockResolvedValue({});
      const mockPatchOfficerFilingResponse = {
        data: {
          ...directorNameMock,
        }
      };
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(UPDATE_PAGE_URL).send({
        director_address: "director_registered_office_address",
      }));

      expect(response.text).not.toContain("Found. Redirecting to " + DIRECTOR_PROTECTED_INFORMATION_PAGE_URL);
      expect(response.text).toContain("Found. Redirecting to " + UPDATE_DIRECTOR_DETAILS_PAGE_URL);
    });

    it.each([[PAGE_URL,DIRECTOR_RESIDENTIAL_ADDRESS_LINK_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PAGE_URL]])(`should redirect to ${DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH} or ${UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH} page if correspondence address is selected and no previous link established`, async (url, redirectLink) => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
      });
      const response = (await request(app).post(url).send({
        director_address: "director_correspondence_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + redirectLink);
    });

    it.each([[PAGE_URL,DIRECTOR_PROTECTED_INFORMATION_PAGE_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_DETAILS_PAGE_URL]])(`should redirect to ${DIRECTOR_PROTECTED_DETAILS_PATH} or ${UPDATE_DIRECTOR_DETAILS_PATH} page if correspondence address is selected and previous link established`, async (url, redirectLink) => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
        isServiceAddressSameAsRegisteredOfficeAddress: true
      });
      const response = (await request(app).post(url).send({
        director_address: "director_correspondence_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + redirectLink);
    });

    it.each([[PAGE_URL,APPOINT_DIRECTOR_CYA_PAGE_URL], [UPDATE_PAGE_URL,UPDATE_DIRECTOR_CYA_PAGE_URL]])(`should patch the isHomeAddressSameAsServiceAddress to false (void previous link) if user uses change path from CYA, modifies the ROA as residential address `, async (url, nextPage) => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        isHomeAddressSameAsServiceAddress: true,
        checkYourAnswersLink: "/check-your-answer"
      });
      mockPatchOfficerFiling.mockResolvedValueOnce({
        data: {
          checkYourAnswersLink: "/check-your-answer"
        }
      });
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validAddress);
      
      const response = (await request(app).post(url).send({
        director_address: "director_registered_office_address",
      }));

      const mappedAddress = {
        "addressLine1": "Line1",
        "addressLine2": "Line2",
        "country": "England",
        "locality": "locality",
        "poBox": "123",
        "postalCode": "UB7 0GB",
        "premises": "premises",
      };

      expect(mockMapCompanyProfileToOfficerFilingAddress).toHaveBeenCalled();
      expect(mockPatchOfficerFiling).toHaveBeenCalled();
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
        "directorResidentialAddressChoice": "director_registered_office_address",
        "isHomeAddressSameAsServiceAddress": false,
        "residentialAddressHasBeenUpdated": (url === UPDATE_PAGE_URL) ? true : undefined,
        "residentialAddress": mappedAddress
      });
      expect(response.text).toContain("Found. Redirecting to " + nextPage);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should redirect to ${APPOINT_DIRECTOR_CHECK_ANSWERS_PATH} page if correspondence address is selected and CYA link established`, async (url) => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
        isServiceAddressSameAsRegisteredOfficeAddress: true,
        checkYourAnswersLink: "/check-your-answer"
      });
      const response = (await request(app).post(url).send({
        director_address: "director_correspondence_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + APPOINT_DIRECTOR_CYA_PAGE_URL);
    });

    it.each([[PAGE_URL,DIRECTOR_RESIDENTIAL_ADDRESS_LINK_URL],[UPDATE_PAGE_URL,UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PAGE_URL]])(`should redirect to ${DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END} page if correspondence address is selected, no previous link and CYA link established`, async (url, redirectLink) => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
        isServiceAddressSameAsRegisteredOfficeAddress: false,
        checkYourAnswersLink: "/check-your-answer"
      });
      const response = (await request(app).post(url).send({
        director_address: "director_correspondence_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + redirectLink);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page with director correspondence address on validation error`, async (url) => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });

      const response = await request(app).post(url).send({});

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(whereDirectorLiveResidentialErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.postalCode);
    });
  });
});