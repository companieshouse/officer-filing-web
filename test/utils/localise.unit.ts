import { getCompanyTypeKeys, getCompanyStatusKeys } from "../../src/utils/api.enumerations";
import {
  lookupCompanyStatus,
  lookupCompanyType
} from "../../src/utils/api.enumerations";
import { getLocalesService, selectLang, addLangToUrl } from "../../src/utils/localise";

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

  it("should default to en", () => {
    expect(selectLang("")).toEqual("en");
    expect(selectLang(undefined)).toEqual("en");
    expect(selectLang("en")).toEqual("en");
  });

  it.each([
    ["/test?lang=cy", "/test", "cy"],
    ["/test/test2?lang=en", "/test/test2", "en"],
    ["/test", "/test", undefined],
    ["/test", "/test", ""],
    ["/test?page=1&lang=cy", "/test?page=1", "cy"],
    ["/test?page=1", "/test?page=1", ""]
  ])("should conditionally add lang to url", (expected, url, lang) => {
    expect(addLangToUrl(url, lang)).toEqual(expected);
  });

  it.each([
    ["/test?lang=cy", "en", "/test?lang=en"],
    ["/test?lang=en", "cy", "/test?lang=cy"],
    ["/test?a=b&lang=cy", "en", "/test?a=b&lang=en"],
    ["/test?lang=en&a=b", "cy", "/test?lang=cy&a=b"]] )
    ("should override the lang and not amend if exist in url" , (url, lang, expected) => {
    expect(addLangToUrl(url, lang)).toEqual(expected);
  });
});
