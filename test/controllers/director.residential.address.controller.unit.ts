jest.mock("../../src/utils/feature.flag");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.profile.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH, DIRECTOR_PROTECTED_DETAILS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH, 
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH, urlParams, DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, 
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH, DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END, 
  DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH_END, DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH, DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH_END,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END, DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END} from '../../src/types/page.urls';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { Request, Response } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getBackLinkUrl } from './../../src/controllers/director.residential.address.controller';
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { validCompanyProfile } from "../mocks/company.profile.mock";
import { whereDirectorLiveResidentialErrorMessageKey } from "../../src/utils/api.enumerations.keys";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

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

const mockRes = {
  render: jest.fn() as any,
  redirect: jest.fn() as any,
} as Response;

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
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockReset();
    mockGetCompanyProfile.mockReset();
    mockPatchOfficerFiling.mockReset();
  });

  describe("get tests", () => {

    it("Should navigate to director address page", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
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

    it(`should have back link value of ${DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH} when user visit page from it`, async () =>  {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
      mockReq.params = {
        companyNumber: COMPANY_NUMBER,
        transactionId: TRANSACTION_ID,
        submissionId: SUBMISSION_ID,
      }
      mockReq.headers.referer = DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH;
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH_END)
    });

    it("Should navigate to error page when feature flag is off", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it(`should have back link value of ${DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH} when user visit page from it`, async () =>  {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
      mockReq.params = {
        companyNumber: COMPANY_NUMBER,
        transactionId: TRANSACTION_ID,
        submissionId: SUBMISSION_ID,
      }
      mockReq.headers.referer = DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH;
      const backLinkUrl = getBackLinkUrl(mockReq);
      expect(backLinkUrl).toContain(DIRECTOR_CORRESPONDENCE_ADDRESS_MANUAL_PATH_END)
    });

    it(`should have back link value of ${DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH} when user visit page from it`, async () =>  {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
      mockReq.params = {
        companyNumber: COMPANY_NUMBER,
        transactionId: TRANSACTION_ID,
        submissionId: SUBMISSION_ID,
      }
      mockReq.headers.referer = DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH;
      const backLinkUrl = getBackLinkUrl(mockReq);
      expect(backLinkUrl).toContain(DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH_END)
    });

    it(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page with director registered office address`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.region);
      expect(response.text).toContain("Premises");
      expect(response.text).toContain(serviceAddressMock.serviceAddress.premises);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine2);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.region);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.country);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.postalCode);
    });

    it(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without director registered office address when it was selected as correspondence address`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
        directorServiceAddressChoice: "director_registered_office_address"
      });
      const response = await request(app).get(PAGE_URL);
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

    it(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without director registered office address line 2 `, async () => {
      validCompanyProfile.registeredOfficeAddress.addressLineTwo = undefined!;
      validCompanyProfile.registeredOfficeAddress.region = undefined!;
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
      });
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).not.toContain("Line2");
      expect(response.text).toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.postalCode);
      expect(response.text).toContain("Premises");
      expect(response.text).not.toContain("Region");
    });

    it(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without optional field for director residential address `, async () => {
      serviceAddressMock.serviceAddress.addressLine2 = undefined!;
      serviceAddressMock.serviceAddress.premises = undefined!;
      serviceAddressMock.serviceAddress.region = undefined!;
      serviceAddressMock.serviceAddress.country = undefined!;
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      const response = await request(app).get(PAGE_URL);
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

    it(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without director registered office address`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.addressLineOne);
      expect(response.text).not.toContain(validCompanyProfile.registeredOfficeAddress.postalCode);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
    });

    it(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page without director correspondence address`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
      });
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).not.toContain(serviceAddressMock.serviceAddress.postalCode);
    });

    it("should catch error if getofficerfiling error", async () => {
      const response = await request(app).get(PAGE_URL);
      mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });
  });

  describe("post tests", () => {

    it(`Should render where director lives page if no radio button is selected`, async () => {
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
      const response = (await request(app).post(PAGE_URL).send({}));
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

    it("should catch error if patch officer filing failed", async () => {
      const mockPatchOfficerFilingResponse = {
      };
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(PAGE_URL).send({}));
      expect(response.text).not.toContain("Select the address where the director lives");
      expect(response.text).not.toContain(PAGE_HEADING);
      expect(response.text).toContain(ERROR_PAGE_HEADING)
    });

    it(`should redirect to ${DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH} page if different address is selected`, async () => {
      const mockPatchOfficerFilingResponse = {
        directorResidentialAddressChoice: "different_address"
      };
      mockGetOfficerFiling.mockReturnValueOnce({
      });
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(PAGE_URL).send({ director_address: "director_different_address" }));
      expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL);
    });

    it(`should redirect to ${DIRECTOR_PROTECTED_DETAILS_PATH} page if registered office address is selected`, async () => {
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
      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_registered_office_address"
      }))
    });

    it(`should redirect to ${APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END} page if registered office address is selected and CYA link exist`, async () => {
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
        const response = (await request(app).post(PAGE_URL).send({
          director_address: "director_registered_office_address"
        }));

      expect(response.text).toContain("Found. Redirecting to " + APPOINT_DIRECTOR_CYA_PAGE_URL);
    });

    it(`should redirect to ${APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END} page if registered office address is selected and check your answers link`, async () => {
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
      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_registered_office_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + APPOINT_DIRECTOR_CYA_PAGE_URL);
    });
  
    it(`should patch the residential address if no registered office address and redirect to protected information page`, async () => {
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

    it(`should redirect to ${DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH} page if correspondence address is selected and no previous link established`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
      });
      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_correspondence_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_RESIDENTIAL_ADDRESS_LINK_URL);
    });

    it(`should redirect to ${DIRECTOR_PROTECTED_DETAILS_PATH} page if correspondence address is selected and previous link established`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
        isServiceAddressSameAsRegisteredOfficeAddress: true
      });
      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_correspondence_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_PROTECTED_INFORMATION_PAGE_URL);
    });

    it(`should patch the isServiceAddressSameAsHomeAddress to false (void previous link) if user uses change path from CYA, modifies the ROA as residential address `, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        isServiceAddressSameAsHomeAddress: true,
        checkYourAnswersLink: "/check-your-answer"
      });

      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_registered_office_address",
      }));

      expect(mockPatchOfficerFiling).toHaveBeenCalled();
      expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, SUBMISSION_ID, {
        "directorResidentialAddressChoice": "director_registered_office_address",
        "protectedDetailsBackLink": "/director-home-address",
        "isServiceAddressSameAsHomeAddress": false
      })

      //expect(response.text).toContain("Found. Redirecting to " + APPOINT_DIRECTOR_CYA_PAGE_URL);
      console.log(response.text);
    });

    it(`should redirect to ${APPOINT_DIRECTOR_CHECK_ANSWERS_PATH} page if correspondence address is selected and CYA link established`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
        isServiceAddressSameAsRegisteredOfficeAddress: true,
        checkYourAnswersLink: "/check-your-answer"
      });
      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_correspondence_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + APPOINT_DIRECTOR_CYA_PAGE_URL);
    });

    it(`should redirect to ${DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END} page if correspondence address is selected, no previous link and CYA link established`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock,
        isServiceAddressSameAsRegisteredOfficeAddress: false,
        checkYourAnswersLink: "/check-your-answer"
      });
      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_correspondence_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_RESIDENTIAL_ADDRESS_LINK_URL);
    });

    it(`should render ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page with director correspondence address on validation error`, async () => {
      mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock,
        ...serviceAddressMock
      });

      const response = await request(app).post(PAGE_URL).send({});

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(whereDirectorLiveResidentialErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.addressLine1);
      expect(response.text).toContain(serviceAddressMock.serviceAddress.postalCode);
    });
  });
});