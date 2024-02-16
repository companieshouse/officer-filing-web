jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/postcode.lookup.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { validCompanyAppointmentResource } from "../../mocks/company.appointment.mock";

import {
  DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  urlParams
} from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";
import { getUKAddressesFromPostcode, getIsValidUKPostcode } from "../../../src/services/postcode.lookup.service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";

const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointmentResource.resource);

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Find the director&#39;s correspondence address";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const CONFIRM_PAGE_URL = DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_CONFIRM_PAGE_URL = UPDATE_DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const CHOOSE_ADDRESS_PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_CHOOSE_ADDRESS_PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const mockGetIsValidUKPostcode = getIsValidUKPostcode as jest.Mock;
const mockGetUKAddressesFromPostcode = getUKAddressesFromPostcode as jest.Mock;

const mockResponseBodyOfUKAddress1: UKAddress = ({
  premise: "123",
  addressLine1: "123 Main St",
  postTown: "London",
  postcode: "SW1A 1AA",
  country: "GB-ENG"
});
const mockResponseBodyOfUKAddress2: UKAddress = ({
  premise: "125",
  addressLine1: "123 Main St",
  postTown: "London",
  postcode: "SW1A 1AA",
  country: "GB-ENG"
});

const mockResponseEmptyBodyCaseInsensitivity : UKAddress[] = [
  {
    "postcode": "IM2 4NN",
    "premise": "FLAT 4 LANSDOWNE",
    "addressLine1": "QUEENS PROMENADE",
    "addressLine2": "DOUGLAS",
    "postTown": "ISLE OF MAN",
    "country": "Isle of Man"
  },
  {
    "postcode": "IM2 4NN",
    "premise": "FLAT 3 LANSDOWNE",
    "addressLine1": "QUEENS PROMENADE",
    "addressLine2": "DOUGLAS",
    "postTown": "ISLE OF MAN",
    "country": "Isle of Man"
  }];
const mockResponseBodyOfUKAddresses: UKAddress[] = [mockResponseBodyOfUKAddress1, mockResponseBodyOfUKAddress2];

describe('Director correspondence address search controller test', () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockPatchOfficerFiling.mockClear();
  });

  describe("get tests",  () => {
    it.each([[PAGE_URL, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END], [UPDATE_PAGE_URL, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END]])(`Should navigate to '%s' page`, async (url, backLink) => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        directorName: "John Smith"
      })
      const response = await request(app).get(url);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(backLink);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });


    it.each([PAGE_URL, UPDATE_PAGE_URL])("Should navigate to error page when feature flag is off for '%s'", async (url) => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(url);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])("Should populate filing on the '%s' page", async (url) => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        serviceAddress: ( {
          postalCode: "SW1A1AA",
          premises: 123
        } )
      })
      const response = await request(app).get(url);

      expect(response.text).toContain("SW1A1AA");
      expect(response.text).toContain("123");
    });
  });

  describe("post tests",  () => {
    it.each([PAGE_URL, UPDATE_PAGE_URL])("Should displays errors and Director name on page if get validation status returns errors for '%s'", async (url) => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        firstName: "John",
        lastName: "Smith"
      })
      const response = await request(app).post(url)
        .send({"postcode": "%%%%%%", "premises": "ゃ"});

      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("%%%%%%");
      expect(response.text).toContain("ゃ");
      if(url == PAGE_URL) {
        // from filing
        expect(response.text).toContain("John Smith");
      } else {
        // from company appointment
        expect(response.text).toContain("John Elizabeth Doe")
      }
      expect(response.text).toContain("UK postcode must only include letters a to z, numbers and spaces");
      expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])("Should displays errors on page if get validation status returns errors - order and priority test for '%s'", async (url) => {
      const response = await request(app).post(url)
        .send({"postcode": "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%",
          "premises": "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ"});

      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("UK postcode must only include letters a to z, numbers and spaces");
      expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
    });

    it.each([PAGE_URL, UPDATE_PAGE_URL])("Should display error when postcode lookup service returns false for '%s'", async (url) => {
      mockGetIsValidUKPostcode.mockReturnValue(false);
      const response = await request(app).post(url).send({"postcode": "SW1A1XY"});

      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("We cannot find this postcode. Enter a different one, or enter the address manually");
    });

    // postcode look up tests
    it.each([PAGE_URL, UPDATE_PAGE_URL])("should call postcode service for validating postcode when formatting of UK postcode is valid for '%s'", async (url) => {
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseBodyOfUKAddresses);
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({});
      const response = await request(app).post(url).send({"postcode": "SW1A1AA", "premises": "123"});

      expect(getIsValidUKPostcode).toHaveBeenCalledWith(expect.anything(),"SW1A1AA");
      expect(getUKAddressesFromPostcode).toHaveBeenCalledWith(expect.anything(), "SW1A1AA");
    });

    // redirect tests
    it.each([[PAGE_URL, CHOOSE_ADDRESS_PAGE_URL], [UPDATE_PAGE_URL, UPDATE_CHOOSE_ADDRESS_PAGE_URL]])("Should navigate to '%s' page when premises is null", async (url, redirectUrl) => {
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseBodyOfUKAddresses);
      const response = await request(app).post(url).send({"postcode": "SW1A1AA"});

      expect(response.text).toContain("Found. Redirecting to " + redirectUrl);
    });

    it.each([[PAGE_URL, CHOOSE_ADDRESS_PAGE_URL], [UPDATE_PAGE_URL, UPDATE_CHOOSE_ADDRESS_PAGE_URL]])("Should navigate to '%s' page when premise is not part of returned addresses", async (url, redirectUrl) => {
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseBodyOfUKAddresses);
      const response = await request(app).post(url).send({"postcode": "SW1A1AA", "premises": "121"});

      expect(response.text).toContain("Found. Redirecting to " + redirectUrl);
    });

    it.each([[PAGE_URL, CONFIRM_PAGE_URL], [UPDATE_PAGE_URL, UPDATE_CONFIRM_PAGE_URL]])("Should navigate to '%s' page when premise is part of returned addresses", async (url, redirectUrl) => {
      mockGetOfficerFiling.mockResolvedValueOnce({});
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseBodyOfUKAddresses);
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({});
      const response = await request(app).post(url).send({"postcode": "SW1A1AA", "premises": "123"});

      expect(response.text).toContain("Found. Redirecting to " + redirectUrl);
    });

    it.each([[PAGE_URL, CONFIRM_PAGE_URL], [UPDATE_PAGE_URL, UPDATE_CONFIRM_PAGE_URL]])("Should navigate to '%s' page when premise is part of returned addresses - case and space insensitivity", async (url, redirectUrl) => {
      mockGetOfficerFiling.mockResolvedValueOnce({});
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseEmptyBodyCaseInsensitivity);
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({});
      const response = await request(app).post(url).send({"postcode": "IM2 4NN", "premises": "flat 4 lansdowne"});

      expect(getIsValidUKPostcode).toHaveBeenCalledWith(expect.anything(),"IM24NN");
      expect(response.text).toContain("Found. Redirecting to " + redirectUrl);
    });
  });
});