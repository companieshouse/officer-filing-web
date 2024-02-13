jest.mock("../../src/utils/address");

import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";
import { validCompanyAppointment } from "../mocks/company.appointment.mock";
import { checkIsCorrespondenceAddressUpdated } from "../../src/utils/is.address.updated";
import { compareAddress } from "../../src/utils/address";

const mockCompareAddress = compareAddress as jest.Mock;

describe("isCorrespondenceAddressUpdate tests", () => {
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
     expect(mockCompareAddress).not.toBeCalled();
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
    expect(mockCompareAddress).toBeCalledWith(officerFiling.serviceAddress, companyAppointment.serviceAddress);
    expect(isAddressUpdated).toBe(result);
  });
})