import { compareAddress } from "../../src/utils/address";
import { Address } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

describe("compareAddress", () => {
  it("should return true if all address fields are the same", () => {
    const addressOne: Address = {
      premises: "123",
      addressLine1: "Main St",
      addressLine2: "Apt 4",
      country: "UK",
      locality: "London",
      postalCode: "SW1A 1AA",
      region: "Greater London"
    };
    const addressTwo: Address = {
      premises: "123",
      addressLine1: "Main St",
      addressLine2: "Apt 4",
      country: "UK",
      locality: "London",
      postalCode: "SW1A 1AA",
      region: "Greater London"
    };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(true);
  });
  
  it("should return false if premises is different", () => {
    const addressOne: Address = {
      premises: "123",
      addressLine1: "Main St",
      addressLine2: "Apt 4",
      country: "UK",
      locality: "London",
      postalCode: "SW1A 1AA",
      region: "Greater London"
    };
    const addressTwo: Address = {
      premises: "456",
      addressLine1: "Main St",
      addressLine2: "Apt 4",
      country: "UK",
      locality: "London",
      postalCode: "SW1A 1AA",
      region: "Greater London"
    };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

  it("should return false if addressLine1 is different", () => {
    const addressOne: Address = {
      premises: "123",
      addressLine1: "Main St",
      addressLine2: "Apt 4",
      country: "UK",
      locality: "London",
      postalCode: "SW1A 1AA",
      region: "Greater London"
    };
    const addressTwo: Address = {
      premises: "123",
      addressLine1: "High St",
      addressLine2: "Apt 4",
      country: "UK",
      locality: "London",
      postalCode: "SW1A 1AA",
      region: "Greater London"
    };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
  });

it("should return false if addressLine2 is different", () => {
    const addressOne: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "UK",
        locality: "London",
        postalCode: "SW1A 1AA",
        region: "Greater London"
    };
    const addressTwo: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 5",
        country: "UK",
        locality: "London",
        postalCode: "SW1A 1AA",
        region: "Greater London"
    };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
});

it("should return false if country is different", () => {
    const addressOne: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "UK",
        locality: "London",
        postalCode: "SW1A 1AA",
        region: "Greater London"
    };
    const addressTwo: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "USA",
        locality: "London",
        postalCode: "SW1A 1AA",
        region: "Greater London"
    };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
});

it("should return false if locality is different", () => {
    const addressOne: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "UK",
        locality: "London",
        postalCode: "SW1A 1AA",
        region: "Greater London"
    };
    const addressTwo: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "UK",
        locality: "Manchester",
        postalCode: "SW1A 1AA",
        region: "Greater London"
    };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
});

it("should return false if postalCode is different", () => {
    const addressOne: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "UK",
        locality: "London",
        postalCode: "SW1A 1AA",
        region: "Greater London"
    };
    const addressTwo: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "UK",
        locality: "London",
        postalCode: "SW1A 1AB",
        region: "Greater London"
    };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
});

it("should return false if region is different", () => {
    const addressOne: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "UK",
        locality: "London",
        postalCode: "SW1A 1AA",
        region: "Greater London"
    };
    const addressTwo: Address = {
        premises: "123",
        addressLine1: "Main St",
        addressLine2: "Apt 4",
        country: "UK",
        locality: "London",
        postalCode: "SW1A 1AA",
        region: "South East"
    };
    const result = compareAddress(addressOne, addressTwo);
    expect(result).toBe(false);
});

});