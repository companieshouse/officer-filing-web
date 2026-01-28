jest.mock("../../src/utils/address");

import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { validCompanyAppointment } from "../mocks/company.appointment.mock";
import { checkIsCorrespondenceAddressUpdated, checkIsResidentialAddressUpdated } from "../../src/utils/is.address.updated";
import { compareAddress } from "../../src/utils/address";

const mockCompareAddress = compareAddress as jest.Mock;

describe("isCorrespondenceAddressUpdate tests", () => {
  beforeEach(() => {
    mockCompareAddress.mockReset();
  });
  
  it.each([
    [true, true, false],
    [true, false, true],
    [true, undefined, true],
    [false, true, true],
    [undefined, true, true],
  ])("should compare correspondence address flags", (filingFlag, appointmentFlag, result) => {
    const officerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: filingFlag,
    } as OfficerFiling;
    const companyAppointment = { ...validCompanyAppointment };
    companyAppointment.serviceAddressIsSameAsRegisteredOfficeAddress = appointmentFlag;

    const isAddressUpdated = checkIsCorrespondenceAddressUpdated(officerFiling, companyAppointment);
    expect(mockCompareAddress).not.toHaveBeenCalledWith();
    expect(isAddressUpdated).toBe(result);
  });

  it.each([
    [validCompanyAppointment.serviceAddress, false],
    [{
      premises: "1",
      addressLine1: "line1",
      addressLine2: "line2",
      locality: "locality",
      region: "region",
      country: "country"
     }, true],
    [undefined, true]
  ])("should compare correspondence addresses", (serviceAddress, result) => {
    const officerFiling = {
      isServiceAddressSameAsRegisteredOfficeAddress: false,
      serviceAddress
    } as OfficerFiling;
    const companyAppointment = { ...validCompanyAppointment };
    companyAppointment.serviceAddressIsSameAsRegisteredOfficeAddress = false;

    mockCompareAddress.mockReturnValue(!result);
    const isAddressUpdated = checkIsCorrespondenceAddressUpdated(officerFiling, companyAppointment);
    expect(mockCompareAddress).toHaveBeenCalledWith(officerFiling.serviceAddress, companyAppointment.serviceAddress);
    expect(isAddressUpdated).toBe(result);
  });
});

describe("checkIsResidentialAddressUpdated tests", () => {
  beforeEach(() => {
    mockCompareAddress.mockReset();
  });

  it.each([
    [true, true, false],
    [true, false, true],
    [true, undefined, true],
    [false, true, true],
    [undefined, true, true],
  ])("should compare residential address flags", (filingFlag, appointmentFlag, result) => {
    const officerFiling = {
      isHomeAddressSameAsServiceAddress: filingFlag,
    } as OfficerFiling;
    const companyAppointment = { ...validCompanyAppointment };
    companyAppointment.residentialAddressIsSameAsServiceAddress = appointmentFlag;

    const isAddressUpdated = checkIsResidentialAddressUpdated(officerFiling, companyAppointment);
    expect(mockCompareAddress).not.toHaveBeenCalledWith();
    expect(isAddressUpdated).toBe(result);
  });

  it.each([
    [validCompanyAppointment.usualResidentialAddress, false],
    [{
      premises: "1",
      addressLine1: "line1",
      addressLine2: "line2",
      locality: "locality",
      region: "region",
      country: "country"
     }, true],
    [undefined, true]
  ])("should compare residential addresses", (usualResidentialAddress, result) => {
    const officerFiling = {
      isHomeAddressSameAsServiceAddress: false,
      usualResidentialAddress
    } as OfficerFiling;
    const companyAppointment = { ...validCompanyAppointment };
    companyAppointment.residentialAddressIsSameAsServiceAddress = false;

    mockCompareAddress.mockReturnValue(!result);
    const isAddressUpdated = checkIsResidentialAddressUpdated(officerFiling, companyAppointment);
    expect(mockCompareAddress).toHaveBeenCalledWith(officerFiling.residentialAddress, companyAppointment.usualResidentialAddress);
    expect(isAddressUpdated).toBe(result);
  });
});
