jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/api.service");
jest.mock("../../src/services/postcode.lookup.service");
jest.mock("../../src/utils/logger");

import { createPublicApiKeyClient } from "../../src/services/api.service";
import {PostcodeLookupService, UKAddress} from '@companieshouse/api-sdk-node/dist/services/postcode-lookup';
import { getUKAddressesFromPostcode, getIsValidUKPostcode } from '../../src/services/postcode.lookup.service';
import {createAndLogError, logger} from "../../src/utils/logger";
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
const mockIsValidUKPostcode = getIsValidUKPostcode as jest.Mock;
const mockGetUKAddressesFromPostcode = getUKAddressesFromPostcode as jest.Mock;
const mockCreateAndLogError = createAndLogError as jest.Mock;

mockCreatePublicApiKeyClient.mockReturnValue( {
    postCodeLookup: {
        isValidUKPostcode: mockIsValidUKPostcode,
        getListOfValidPostcodeAddresses: mockGetUKAddressesFromPostcode
    }
});

const ERROR: Error = new Error("oops");
mockCreateAndLogError.mockReturnValue(ERROR);

describe("isValidPostcode test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
      });

    it("should return true when postcode is valid", async () => {
        mockIsValidUKPostcode.mockResolvedValueOnce(true);
        const isValid = await getIsValidUKPostcode("http://example.postcode.lookup", "SW1A1AA");
        expect(isValid).toBe(true);
    });

    it("should return true when postcode is valid", async () => {
        mockIsValidUKPostcode.mockResolvedValueOnce(false);
        const isValid = await getIsValidUKPostcode("http://example.postcode.lookup", "SW1A1XZ");
        expect(isValid).toBe(false);
    });
});

describe("getUKAddressesFromPostcode test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
      });

    it("should return UK addresses for a valid postcode", async () => {
        mockGetUKAddressesFromPostcode.mockResolvedValueOnce(mockResponseBodyOfUKAddresses);
        const result = await getUKAddressesFromPostcode("http://example.postcode.lookup", "SW1A1AA");

        expect(result).toHaveLength(2);
        expect(JSON.stringify(result[0])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress1));
        expect(JSON.stringify(result[1])).toEqual(JSON.stringify(mockResponseBodyOfUKAddress2));
    });
});
