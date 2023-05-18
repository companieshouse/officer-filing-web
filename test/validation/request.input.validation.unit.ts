import { isValidUrl } from "../../src/validation/request.input.validation";

const validUrl = "/officer-filing-web/confirm-company?companyNumber=12345678";
const invalidUrl = "/confirm-director?UrlIsInvalid";

describe("formatTitleCase tests", () => {
    it("should return true if url begins with officer-filing-web", () => {
        const result: boolean = isValidUrl(validUrl);
        expect(result).toBe(true);
    })

    it("should return false if url does not begin with officer-filing-web", () => {
        const result: boolean = isValidUrl(invalidUrl);
        expect(result).toBe(false);
      })
});