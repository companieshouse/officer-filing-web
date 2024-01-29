jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/postcode.lookup.service");
jest.mock("../../src/services/company.profile.service");
import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  urlParams
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getUKAddressesFromPostcode, getIsValidUKPostcode } from "../../src/services/postcode.lookup.service";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
import { getCompanyProfile, mapCompanyProfileToOfficerFilingAddress } from "../../src/services/company.profile.service";
import { mock } from "node:test";
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockMapCompanyProfileToOfficerFilingAddress = mapCompanyProfileToOfficerFilingAddress as jest.Mock;

mockIsActiveFeature.mockReturnValue(true);
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Find the director&#39;s home address";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const CHOOSE_ADDRESS_PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const CONFIRM_PAGE_URL = DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH
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

const validResidentialAddress = {
  "premises": "123",
  "addressLine1": "123 Main St",
  "addressLine2": "London",
  "locality": "London",
  "postalCode": "SW1A 1AA",
  "country": "England"
};

describe('Director residential address search controller test', () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
    mockPatchOfficerFiling.mockClear();
  });

  describe("get tests",  () => {
    it("Should navigate to director residential address search page", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        directorName: "John Smith"
      });
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validResidentialAddress);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END);
      expect(response.text).not.toContain(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should navigate to director residential address search page with correspondence address back link when roa is incomplete", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        directorName: "John Smith"
      });
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce({ ... validResidentialAddress, premises: null });
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should navigate to director residential address search page with correspondence address back link when roa mapping fails", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        directorName: "John Smith"
      });
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(undefined);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should navigate to error page when feature flag is off", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it("Should populate filing on the page", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        residentialAddress: ( {
          postalCode: "SW1A1AA",
          premises: 123
          } )
      })
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validResidentialAddress);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain("SW1A1AA");
      expect(response.text).toContain("123");
    });
  });

  describe("post tests",  () => {

    // validation error render tests
    it("Should displays errors and Director name on page if get validation status returns errors", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        firstName: "John",
        lastName: "Smith"
      });
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validResidentialAddress);

      const response = await request(app).post(PAGE_URL)
      .send({"postcode": "%%%%%%", "premises": "ゃ"});

      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("%%%%%%");
      expect(response.text).toContain("ゃ");
      expect(response.text).toContain("John Smith");
      expect(response.text).toContain("UK postcode must only include letters a to z, numbers and spaces");
      expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should displays errors on page if get validation status returns errors - order and priority test", async () => {
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validResidentialAddress);

      const response = await request(app).post(PAGE_URL)
      .send({"postcode": "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", 
             "premises": "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ"});

      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("UK postcode must only include letters a to z, numbers and spaces");
      expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
    });

    it("Should display error when postcode lookup service returns false", async () => {
      mockGetIsValidUKPostcode.mockReturnValue(false);
      mockGetCompanyProfile.mockResolvedValueOnce({});
      mockMapCompanyProfileToOfficerFilingAddress.mockReturnValueOnce(validResidentialAddress);

      const response = await request(app).post(PAGE_URL).send({"postcode": "SW1A1XY"});
      
      expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("We cannot find this postcode. Enter a different one, or enter the address manually");
    });

    // postcode look up tests
    it("should call postcode service for validating postcode when formatting of UK postcode is valid", async () => {
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseBodyOfUKAddresses);
      const response = await request(app).post(PAGE_URL).send({"postcode": "SW1A1AA", "premises": "123"});

      expect(getIsValidUKPostcode).toHaveBeenCalledWith(expect.anything(),"SW1A1AA");
      expect(getUKAddressesFromPostcode).toHaveBeenCalledWith(expect.anything(), "SW1A1AA");
    });

    // redirect tests
    it("Should navigate to director residential address choose address page when premises is null", async () => {
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseBodyOfUKAddresses);
      const response = await request(app).post(PAGE_URL).send({"postcode": "SW1A1AA"});

      expect(response.text).toContain("Found. Redirecting to " + CHOOSE_ADDRESS_PAGE_URL);
    });

    it("Should navigate to director residential address choose address page when premise is not part of returned addresses", async () => {
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseBodyOfUKAddresses);
      const response = await request(app).post(PAGE_URL).send({"postcode": "SW1A1AA", "premises": "121"});

      expect(response.text).toContain("Found. Redirecting to " + CHOOSE_ADDRESS_PAGE_URL);
    });

    it("Should navigate to director residential address choose address page when premise is part of returned addresses", async () => {
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseBodyOfUKAddresses);
      const response = await request(app).post(PAGE_URL).send({"postcode": "SW1A1AA", "premises": "123"});

      expect(response.text).toContain("Found. Redirecting to " + CONFIRM_PAGE_URL);
    });

    it("Should navigate to director residential address choose address page when premise is part of returned addresses - case and space insensitivity", async () => {
      mockGetIsValidUKPostcode.mockReturnValue(true);
      mockGetUKAddressesFromPostcode.mockReturnValue(mockResponseEmptyBodyCaseInsensitivity);
      const response = await request(app).post(PAGE_URL).send({"postcode": "IM2 4NN", "premises": "flat 4 lansdowne"});

      expect(getIsValidUKPostcode).toHaveBeenCalledWith(expect.anything(),"IM24NN");
      expect(response.text).toContain("Found. Redirecting to " + CONFIRM_PAGE_URL);
    });
  });
});