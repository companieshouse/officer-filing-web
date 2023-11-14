jest.mock("express-validator" );

import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { checkValidations } from '../../src/middleware/validation.middleware';


const mockValidationResult = validationResult as unknown as jest.Mock;

const req = {} as Request;
const res = { redirect: jest.fn() as any } as Response;
const next = jest.fn();

describe("Validation Middleware tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should catch the error and call next(err)", () => {
    mockValidationResult.mockReturnValueOnce( () => { throw new Error("Input is required"); });
    checkValidations(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("should render page with error and call next(err)", () => {
    mockValidationResult.mockReturnValueOnce({text: ["Input is required"]});
    checkValidations(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});