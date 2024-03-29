import {Address} from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { compareAddress } from "../../src/utils/address";

const addressOne: Address = {
  premises: "123",
  addressLine1: "Main St",
  addressLine2: "Apt 4",
  country: "UK",
  locality: "London",
  postalCode: "SW1A 1AA",
  region: "Greater London"
};

const addressOneWithoutAddressLine2: Address = {
  premises: "123",
  addressLine1: "Main St",
  country: "UK",
  locality: "London",
  postalCode: "SW1A 1AA",
  region: "Greater London"
};

describe("compareAddress", () => {
  it("should return true if all address fields are the same", () => {
    const addressTwo: Address = { ...addressOne };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(true);
  });

  it("should return true if address line 2 is undefined for one and empty for another address", () => {
    const addressTwo: Address = { ...addressOneWithoutAddressLine2, addressLine2: "" };
    const result = compareAddress(addressOneWithoutAddressLine2, addressTwo);
    expect(result).toBe(true);
  });

  it("should return false if address line 2 is removed.", () => {
    const addressTwo: Address = { ...addressOne, addressLine2: "" };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if premises is different", () => {
    const addressTwo: Address = { ...addressOne, premises: "456" };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if addressLine1 is different", () => {
    const addressTwo: Address = { ...addressOne, addressLine1: "High St" };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if addressLine2 is different", () => {
    const addressTwo: Address = { ...addressOne, addressLine2: "Apt 5" };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if country is different", () => {
    const addressTwo: Address = { ...addressOne, country: "USA" };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if locality is different", () => {
    const addressTwo: Address = { ...addressOne, locality: "Manchester" };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if postalCode is different", () => {
    const addressTwo: Address = { ...addressOne, postalCode: "SW1A 1AB" };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if region is different", () => {
    const addressTwo: Address = { ...addressOne, region: "South East" };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if locality is undefined in second address", () => {
    const addressTwo: Address = { ...addressOne, locality: undefined } as any as Address;
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if country is undefined in second address", () => {
    const addressTwo: Address = { ...addressOne, country: undefined } as any as Address;
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if address line 1 is undefined in second address", () => {
    const addressTwo: Address = { ...addressOne, addressLine1: undefined } as any as Address;
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });
});