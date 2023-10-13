jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/postcode.lookup.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import {
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_CHOOSE_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  urlParams
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getOfficerFiling } from "../../src/services/officer.filing.service";
import { getUKAddressesFromPostcode, getIsValidUKPostcode } from "../../src/services/postcode.lookup.service";
import { getCountryFromKey } from "../../src/controllers/director.residential.address.search.controller";
import { UKAddress } from "@companieshouse/api-sdk-node/dist/services/postcode-lookup";
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Where does the director live?";
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

describe('test getCountryFromKey', () => {
  it('should return Scotland for GB-SCT', () => {
    const result = getCountryFromKey('GB-SCT');
    expect(result).toEqual('Scotland');
  });

  it('should return Wales for GB-WLS', () => {
    const result = getCountryFromKey('GB-WLS');
    expect(result).toEqual('Wales');
  });

  it('should return England for GB-ENG', () => {
    const result = getCountryFromKey('GB-ENG');
    expect(result).toEqual('England');
  });

  it('should return Northern Ireland for GB-NIR', () => {
    const result = getCountryFromKey('GB-NIR');
    expect(result).toEqual('Northern Ireland');
  });

  it('should return Channel Island for Channel Island', () => {
    const result = getCountryFromKey('Channel Island');
    expect(result).toEqual('Channel Island');
  });

  it('should return Isle of Man for Isle of Man', () => {
    const result = getCountryFromKey('Isle of Man');
    expect(result).toEqual('Isle of Man');
  });

  it('should return undefined for an unknown country key', () => {
    const result = getCountryFromKey('unknown');
    expect(result).toBeUndefined();
  });
});

describe('Director residential address search controller test', () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
    mockGetOfficerFiling.mockClear();
  });

  describe("get tests",  () => {
    it("Should navigate to director residential address search page", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        directorName: "John Smith"
      })
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(PAGE_HEADING);
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
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain("SW1A1AA");
      expect(response.text).toContain("123");
    });
  });

  describe("post tests",  () => {

    // validation error render tests
    it("Should displays errors on page if get validation status returns errors", async () => {
      const response = await request(app).post(PAGE_URL)
      .send({"postcode": "%%%%%%", "premises": "ゃ"});

      expect(response.text).toContain("%%%%%%");
      expect(response.text).toContain("ゃ");
      expect(response.text).toContain("UK postcode must only include letters a to z, numbers and spaces");
      expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
    });

    it("Should displays errors on page if get validation status returns errors - order and priority test", async () => {
      const response = await request(app).post(PAGE_URL)
      .send({"postcode": "%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%", 
             "premises": "ゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃゃ"});

      expect(response.text).toContain("UK postcode must only include letters a to z, numbers and spaces");
      expect(response.text).toContain("Property name or number must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
    });

    it("Should display error when postcode lookup service returns false", async () => {
      mockGetIsValidUKPostcode.mockReturnValue(false);
      const response = await request(app).post(PAGE_URL).send({"postcode": "SW1A1XY"});

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