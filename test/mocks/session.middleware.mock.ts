jest.mock("ioredis");
jest.mock("../../src/middleware/session.middleware");

import { NextFunction, Request, Response } from "express";
import { SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import { Session } from "@companieshouse/node-session-handler";

export const mockSessionStore = jest.fn();

export const mockCreateSessionMiddleware = jest.fn();

export const session = new Session();

let shouldThrowError = false;
let errorMessage = "";

mockCreateSessionMiddleware.mockImplementation((sessionStore: SessionStore) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (shouldThrowError) {
            throw new Error(errorMessage || "Default mock error");
        }
        req.session = session;
        req.session.data.extra_data["payment-nonce"] = "123456";
        next();
    };
});

export const setShouldThrowError = (value: boolean, message?: string) => {
    shouldThrowError = value;
    errorMessage = message || "";
};

jest.mock("../../src/middleware/session.middleware", () => ({
  createSessionMiddleware: mockCreateSessionMiddleware,
}));

export default { mockCreateSessionMiddleware, setShouldThrowError };
