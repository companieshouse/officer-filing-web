import { STOP_TYPE } from "../../src/utils/constants";
import { urlUtils, sanitizeStopType } from "../../src/utils/url";
import { Request } from "express";

describe("getCompanyNumberFromRequestParams", () => { 
  it("should return the company number from the request params", () => {
    const req = {
      params: {
        companyNumber: "12345678"
      }
    } as any as Request;
    const result = urlUtils.getCompanyNumberFromRequestParams(req);
    expect(result).toBe("12345678");
  });

  it("should return an empty string if the company number is not in the request params", () => {
    const req = {
      params: {}
    } as any as Request;
    const result = urlUtils.getCompanyNumberFromRequestParams(req);
    expect(result).toBe("");
  });

  it("should sanitize the company number from the request params", () => {
    const req = {
      params: {
        companyNumber: "1</a>45678"
      }
    } as any as Request;
    const result = urlUtils.getCompanyNumberFromRequestParams(req);
    expect(result).toBe("1a45678");
  });

  it("should return an empty string if the transaction is not in the request params", () => {
    const req = {
      params: {}
    } as any as Request;
    const result = urlUtils.getTransactionIdFromRequestParams(req);
    expect(result).toBe("");
  });

  it("should return the transaction id from the request params", () => {
    const req = {
      params: {
        transactionId: "170561-250216-690427"
      }
    } as any as Request;
    const result = urlUtils.getTransactionIdFromRequestParams(req);
    expect(result).toBe("170561-250216-690427");
  });

  it("should sanitize the transaction id from the request params", () => {
    const req = {
      params: {
        transactionId: "170561!%&-{250216}_-[690427]"
      }
    } as any as Request;
    const result = urlUtils.getTransactionIdFromRequestParams(req);
    expect(result).toBe("170561-250216-690427");
  });

  it("should return an empty string if the submission id is not in the request params", () => {
    const req = {
      params: {}
    } as any as Request;
    const result = urlUtils.getSubmissionIdFromRequestParams(req);
    expect(result).toBe("");
  });

  it("should return the submission id from the request params", () => {
    const req = {
      params: {
        submissionId: "633aac06d8879104bbc81acb"
      }
    } as any as Request;
    const result = urlUtils.getSubmissionIdFromRequestParams(req);
    expect(result).toBe("633aac06d8879104bbc81acb");
  });

  it("should sanitize the submission id from the request params", () => {
    const req = {
      params: {
        submissionId: "633\.c06d88_-79104bb(c)81acb"
      }
    } as any as Request;
    const result = urlUtils.getSubmissionIdFromRequestParams(req);
    expect(result).toBe("633c06d8879104bbc81acb");
  });

  it("should return an empty string if the appointment id is not in the request params", () => {
    const req = {
      params: {}
    } as any as Request;
    const result = urlUtils.getAppointmentIdFromRequestParams(req);
    expect(result).toBe("");
  });

  it("should return the appointment id from the request params", () => {
    const req = {
      params: {
        appointmentId: "1Kl63l-R7Kik7XkGNnQ3Z_vARCVs"
      }
    } as any as Request;
    const result = urlUtils.getAppointmentIdFromRequestParams(req);
    expect(result).toBe("1Kl63l-R7Kik7XkGNnQ3Z_vARCVs");
  });

  it("should sanitize the appointment id from the request params", () => {
    const req = {
      params: {
        appointmentId: "1Kl63l-R7K.ik7XkG,NnQ3+ZvARCVs"
      }
    } as any as Request;
    const result = urlUtils.getAppointmentIdFromRequestParams(req);
    expect(result).toBe("1Kl63l-R7Kik7XkGNnQ3ZvARCVs");
  });

  it("should get back link from request params", () => {
    const req = {
      query: {
        backLink: "confirm-correspondence-address"
      }
    } as any as Request;
    const result = urlUtils.getBackLinkFromRequestParams(req);
    expect(result).toBe("confirm-correspondence-address");
  });

  it("should get no back link from multiple request params", () => {
    const req = {
      query: {
        backLink: ["confirm-correspondence-address", ""]
      }
    } as any as Request;
    const result = urlUtils.getBackLinkFromRequestParams(req);
    expect(result).toBeUndefined;
  });

  it("should get no back link from request params without backLink param", () => {
    const req = {
      query: {
      }
    } as any as Request;
    const result = urlUtils.getBackLinkFromRequestParams(req);
    expect(result).toBeUndefined;
  });

  it("should sanitize stop type", () => {
    const result = sanitizeStopType("!pre-october-2009ABC");
    expect(result).toBe("pre-october-2009");
  });

  it("should sanitize all stop types", () => {
    for (let stopType in Object.keys(STOP_TYPE)) {
      const result = sanitizeStopType(stopType);
      expect(result).toBe(stopType);
    }
  });

  it("should sanitize missing stop type", () => {
    const result = sanitizeStopType(undefined);
    expect(result).toBe("");
  });

  it("should sanitize multiple stop types to select none", () => {
    const result = sanitizeStopType(["!pre-october-2009ABC", "pre-october-2009"]);
    expect(result).toBe("");
  });
});
