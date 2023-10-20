jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/api.service");
jest.mock("../../src/utils/logger");

import { createPublicApiKeyClient } from "../../src/services/api.service";
import { UKAddress } from '@companieshouse/api-sdk-node/dist/services/postcode-lookup';
import { getUKAddressesFromPostcode, getIsValidUKPostcode } from '../../src/services/postcode.lookup.service';
import { createAndLogError } from "../../src/utils/logger";
const mockResponseBodyOfUKAddress1: UKAddress = ({
    premise: "123",
    addressLine1: "123 Main St",
    postTown: "London",
    postcode: "SW1A 1AA",
    country: "GB-ENG"
});
const mockResponseBodyOfUKAddress2: UKAddress = ({
    premise: "125",
    addressLine1: "125 Main St",
    postTown: "London",
    postcode: "SW1A 1AA",
    country: "GB-ENG"
});
const mockResponseBodyOfUKAddresses: UKAddress[] = [mockResponseBodyOfUKAddress1, mockResponseBodyOfUKAddress2];

const mockCreatePublicApiKeyClient = createPublicApiKeyClient as jest.Mock;
const mockIsValidUKPostcode = jest.fn();
const mockGetUKAddressesFromPostcode = jest.fn();
const mockCreateAndLogError = createAndLogError as jest.Mock;
mockCreatePublicApiKeyClient.mockReturnValue( {
    postCodeLookup: {
        isValidUKPostcode: mockIsValidUKPostcode,
        getListOfValidPostcodeAddresses: mockGetUKAddressesFromPostcode
    }
});

mockCreateAndLogError.mockReturnValue(new Error());

describe("isValidPostcode test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
      });

    it("should return true when postcode is valid", async () => {
        mockIsValidUKPostcode.mockResolvedValue(true);
        const isValid = await getIsValidUKPostcode("http://example.postcode.lookup", "SW1A1AA");
        expect(isValid).toBe(true);
    });

    it("should return true when postcode is valid", async () => {
        mockIsValidUKPostcode.mockResolvedValueOnce(false);
        const isValid = await getIsValidUKPostcode("http://example.postcode.lookup", "SW1A1XZ");
        expect(isValid).toBe(false);
    });

    it("should return false when postcode is undefined", async () => {
        mockIsValidUKPostcode.mockResolvedValueOnce(undefined);
        const isValid = await getIsValidUKPostcode("http://example.postcode.lookup", "SW1A1XZ");
        expect(isValid).toBe(false);
    });
});

describe("getUKAddressesFromPostcode test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
      });

    it("should throw an error when no UK addresses are returned", async () => {
        mockGetUKAddressesFromPostcode.mockReturnValueOnce({ httpStatusCode: 500, resource: null });
        const postcode = 'SW1A1XY';
        await getUKAddressesFromPostcode("http://example.postcode.lookup", postcode)
          .then(() => {
              fail("Was expecting an error to be thrown.");
          })
          .catch(() => {
              expect(createAndLogError).toHaveBeenCalledWith("Failed to get UK addresses for postcode SW1A1XY");
          });
    });

    it("should return UK addresses for a valid postcode", async () => {
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce({httpStatusCode: 200, resource: mockResponseBodyOfUKAddresses});
        const result = await getUKAddressesFromPostcode("http://example.postcode.lookup", "SW1A1AA");

        expect(result).toHaveLength(2);
        expect(JSON.stringify(result[0])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress1));
        expect(JSON.stringify(result[1])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress2));
    });

    it("should sort UK addresses ascendingly", async () => {
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce({httpStatusCode: 200, resource: mockResponseBodyOfUKAddresses.reverse()});
        const result = await getUKAddressesFromPostcode("http://example.postcode.lookup", "SW1A1AA");

        expect(result).toHaveLength(2);
        expect(JSON.stringify(result[0])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress1));
        expect(JSON.stringify(result[1])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress2));
    });
});
