import { getCompanyTypeKeys, getCompanyStatusKeys } from "../../src/utils/api.enumerations";
import {
  lookupCompanyStatus,
  lookupCompanyType
} from "../../src/utils/api.enumerations";
import { getLocalesService, selectLang } from "../../src/utils/localise";

describe("localise tests", () => {
  it("should localise company status to be same as api constants for en", () => {
    const locales = getLocalesService();
    for (const key in getCompanyStatusKeys) {
      const companyStatus = lookupCompanyStatus(key);
      const localisedCompanyStatus =  locales.i18nCh.resolveSingleKey("company-status-" + key, "en")
      expect(localisedCompanyStatus).toEqual(companyStatus);
    }
  });

  it("should localise company type to be same as api constants for en", () => {
    const locales = getLocalesService();
    for (const key in getCompanyTypeKeys) {
      const companyType = lookupCompanyType(key);
      const localisedCompanyType =  locales.i18nCh.resolveSingleKey("company-type-" + key, "en")
      expect(localisedCompanyType).toEqual(companyType);
    }
  });

  it("should defaul to en", () => {
    expect(selectLang("")).toEqual("en");
  });
});
