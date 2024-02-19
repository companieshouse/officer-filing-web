import { toReadableFormat } from "../../src/utils/date";

describe("toReadableFormat", () => {

  it("should default to en date", () => {
    const date = "2020-01-01";
    const result = toReadableFormat(date);
    expect(result).toEqual("1 January 2020");
  });

  it("should localise en date", () => {
    const date = "2020-01-01";
    const result = toReadableFormat(date, "en");
    expect(result).toEqual("1 January 2020");
  });

  it("should localise cy date", () => {
    const date = "2020-01-01";
    const result = toReadableFormat(date, "cy");
    expect(result).toEqual("1 Ionawr 2020");
  });

  it.each([
    ["2020-03-10", "en", "10 March 2020"],
    ["2020-03-10", "cy", "10 Mawrth 2020"],
    ["2020-10-08", "cy", "8 Hydref 2020"],
  ])("should localise %s date to %s", (date, lang, expected) => {
    const result = toReadableFormat(date, lang);
    expect(result).toEqual(expected);
  });
});
