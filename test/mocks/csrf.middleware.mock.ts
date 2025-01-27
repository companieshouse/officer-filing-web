jest.mock("@companieshouse/web-security-node", () => ({
  CsrfProtectionMiddleware: jest.fn(() => (req: Request, res: Response, next: NextFunction) => {
    next();
  }),
}));

jest.mock("../../src/middleware/csrf.middleware");

import { NextFunction, Request, Response } from "express";
import { createCsrfProtectionMiddleware } from "../../src/middleware/csrf.middleware";
// import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";

const mockCreateCsrfProtectionMiddleware = jest.fn();

mockCreateCsrfProtectionMiddleware.mockImplementation((sessionStore: any) => {
    return (req: Request, res: Response, next: NextFunction) => {
        next();
    };
});

jest.mock("../../src/middleware/csrf.middleware", () => ({
  createCsrfProtectionMiddleware: mockCreateCsrfProtectionMiddleware,
}));

export default mockCreateCsrfProtectionMiddleware;
