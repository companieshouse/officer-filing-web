import {UKAddress} from '@companieshouse/api-sdk-node/dist/services/postcode-lookup';
import {createAndLogError, logger} from "../utils/logger";
import {Resource} from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import {createPublicApiKeyClient} from "./api.service";

export const getUKAddressesFromPostcode = async (postcodeAddressesLookupURL: string, postcode: string): Promise<UKAddress[]> => {
    const apiClient: ApiClient = createPublicApiKeyClient();
    logger.debug(`Retrieving UK addresses for postcode ${postcode}`);

    const castedSdkResponse: Resource<UKAddress[]> = await apiClient.postCodeLookup.getListOfValidPostcodeAddresses(postcodeAddressesLookupURL, postcode);

    if(castedSdkResponse.resource === undefined) {
        throw createAndLogError(`Failed to get UK addresses for postcode ${postcode}`);
    }

    logger.debug(`Retrieved UK addresses for postcode ${postcode}`);
    return castedSdkResponse.resource;
}

export const getIsValidUKPostcode = async (postcodeValidationUrl: string, postcode: string): Promise<boolean> => {
    const apiClient: ApiClient = createPublicApiKeyClient();

    const sdkResponse: boolean = await apiClient.postCodeLookup.isValidUKPostcode(postcodeValidationUrl, postcode);

    if (!sdkResponse) {
        logger.debug(`Postcode lookup GET request returned no response for postcode ${postcode}`);
        return false;
    }
    return sdkResponse;
}