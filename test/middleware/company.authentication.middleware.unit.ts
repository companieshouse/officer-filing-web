jest.mock("ioredis");
jest.mock("../../src/utils/feature.flag");
jest.mock("@companieshouse/web-security-node")

import request from "supertest";
import { Request, Response, NextFunction } from "express";
import app from "../../src/app";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { companyAuthenticationMiddleware } from "../../src/middleware/company.authentication.middleware";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
const mockAuthMiddleware = jest.fn();
jest.mock("@companieshouse/web-security-node", () => ({
    authMiddleware: jest.fn(() => mockAuthMiddleware),
}));

describe("company authentication middleware tests", () => {

    const mockRequest = {} as Request;
    const mockResponse = {} as Response;
    const mockNext = jest.fn() as NextFunction;
    
    beforeEach(() => {
     jest.clearAllMocks();
    });
    
    it("should return 500 error page", async () => {
     mockIsActiveFeature.mockReturnValueOnce(false);
     const response = await request(app).get("/appoint-update-remove-company-officer");
    
     expect(response.text).toContain("Sorry, there is a problem with this service");
    });
    
    it("should not return 500 error page", async () => {
     mockIsActiveFeature.mockReturnValueOnce(true);
     const response = await request(app).get("/appoint-update-remove-company-officer");
    
     expect(response.text).not.toContain("Sorry, there is a problem with this service");
    });

    it("should call next if originalUrl includes '/cannot-use'", () => {
        mockRequest.originalUrl = "http://some-chs-endpoint/company/cannot-use";
        companyAuthenticationMiddleware(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
    });

    it("should call authMiddleware with correct config if originalUrl does not include '/cannot-use'", () => {
        mockRequest.originalUrl = "http://some-chs-endpoint/company/some-url";
        mockRequest.params = { PARAM_COMPANY_NUMBER: "12345678" };

        companyAuthenticationMiddleware(mockRequest, mockResponse, mockNext);
        expect(mockAuthMiddleware).toHaveBeenCalled();
        expect(mockAuthMiddleware).toHaveBeenCalledWith(
            {
                originalUrl: "http://some-chs-endpoint/company/some-url",
                params: {
                    PARAM_COMPANY_NUMBER: "12345678",
                },
            },
            {},
            mockNext
        );
    });
});