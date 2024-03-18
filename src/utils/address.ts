import { Address } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
/**
 * Determine whether two addresses are identical.
 * @param addressOne
 * @param addressTwo
 * false positive, continue if an address element is undefined and another element is empty.
 * @returns true if the address' are identical, false otherwise.
 */
export const compareAddress = (addressOne: Address | undefined, addressTwo: Address | undefined): boolean => {
  const fields = ['premises', 'addressLine1', 'addressLine2', 'country', 'locality', 'postalCode', 'region'];

  for (const field of fields) {
    const valueOne = addressOne?.[field]?.toLowerCase().trim();
    const valueTwo = addressTwo?.[field]?.toLowerCase().trim();

    if ((valueOne === undefined && valueTwo === '') || (valueTwo === undefined && valueOne === '')) {
      continue;
    }

    if (valueOne !== valueTwo) {
      return false;
    }
  }
  return true;
};