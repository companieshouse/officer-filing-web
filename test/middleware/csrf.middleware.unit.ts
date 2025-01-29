import { CsrfError } from "@companieshouse/web-security-node";
import { csrfErrorHandler } from "../../src/middleware/csrf.middleware";


describe("csrfErrorHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls next when not CSRF Error", () => {
    const nextMock = jest.fn();
    const error = new Error("Non-CSRF error");

    csrfErrorHandler(
      error,
      // @ts-expect-error  Not using the attributes of request so can be an empty object
      {},
      {},
      nextMock
    );

    expect(nextMock).toHaveBeenCalledWith(error);
  });

  it("renders 403 error when CSRF error", () => {
    const nextMock = jest.fn();
    const error = new CsrfError("Token mismatch");

    const resMock: {
            status?: any,
            render?: any
        } = {};
    resMock.status = jest.fn((_) => resMock);
    resMock.render = jest.fn((_, __) => resMock);

    csrfErrorHandler(
      error,
      // @ts-expect-error  Not using the attributes of request so can be an empty object
      {},
      resMock,
      nextMock
    );

    expect(nextMock).not.toHaveBeenCalled();
    expect(resMock.status).toHaveBeenCalledWith(403);
    expect(resMock.render).toHaveBeenCalledWith(
      "csrf-error", {
        csrfErrors: true
      }
    );
  });
});
