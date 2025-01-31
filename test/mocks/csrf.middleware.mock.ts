jest.mock("@companieshouse/web-security-node", () => ({
  CsrfProtectionMiddleware: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    next();
  }),
}));

jest.mock("../../src/middleware/csrf.middleware");

import { NextFunction, Request, Response } from "express";
import { createCsrfProtectionMiddleware, csrfErrorHandler } from "../../src/middleware/csrf.middleware";

export const mockCreateCsrfProtectionMiddleware = jest.fn();
export const mockCsrfErrorHandler = jest.fn();

mockCreateCsrfProtectionMiddleware.mockImplementation((sessionStore: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        next();
    };
});

jest.mock("../../src/middleware/csrf.middleware", () => ({
  createCsrfProtectionMiddleware: mockCreateCsrfProtectionMiddleware,
  csrfErrorHandler: mockCsrfErrorHandler,
}));

export default mockCreateCsrfProtectionMiddleware;
