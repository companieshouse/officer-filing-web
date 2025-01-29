import { CsrfError } from "@companieshouse/web-security-node";
import { csrfErrorHandler } from "../../src/middleware/csrf.middleware";
import { Request, Response, NextFunction } from "express";

describe("csrfErrorHandler", () => {
  let nextMock: jest.Mock;
  let resMock: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    nextMock = jest.fn();
    resMock = {
      status: jest.fn().mockReturnThis(),
      render: jest.fn(),
    };
  });

  it("calls next when not CSRF Error", () => {
    const error = new Error("Non-CSRF error");

    csrfErrorHandler(
      error,
      {} as Request,
      {} as Response,
      nextMock
    );

    expect(nextMock).toHaveBeenCalledWith(error);
  });

  it("renders 403 error when CSRF error", () => {
    const error = new CsrfError("Token mismatch");

    csrfErrorHandler(
      error,
      {} as Request,
      resMock as Response,
      nextMock
    );

    expect(nextMock).not.toHaveBeenCalled();
    expect(resMock.status).toHaveBeenCalledWith(403);
    expect(resMock.render).toHaveBeenCalledWith("csrf-error", { csrfErrors: true });
  });
});

