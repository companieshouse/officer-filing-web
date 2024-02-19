jest.mock("../../src/services/officer.filing.service");
jest.mock('express');
jest.mock('../../src/utils/url')

import { Request, Response } from 'express';
import { patchOfficerFiling } from "../../src/services/officer.filing.service";
import { checkYourAnswersMiddleware } from "../../src/middleware/check.your.answers.middleware";

const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;

describe("service availability middleware tests", () => {
  const res = {
    status: jest.fn().mockReturnThis() as any,
    render: jest.fn() as any,
    redirect: jest.fn() as any,
  } as Response;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should patch the check your answers link if the referrer was the check your answers page", async () => {
    const req = { headers: { referer: "director-check-answers" } } as unknown as Request;
    checkYourAnswersMiddleware()(req, res, next);
    expect(mockPatchOfficerFiling).toHaveBeenCalled();
  });

  it("should patch the check your answers link if the referrer was the check your answers page and has query params", async () => {
    const req = { headers: { referer: "director-check-answers?lang=en" } } as unknown as Request;
    checkYourAnswersMiddleware()(req, res, next);
    expect(mockPatchOfficerFiling).toHaveBeenCalled();
  });

  it("should not patch the check your answers link if the referrer was not the check your answers page", async () => {
    const req = { headers: { referer: "director-name" }} as unknown as Request;
    checkYourAnswersMiddleware()(req, res, next);
    expect(mockPatchOfficerFiling).not.toHaveBeenCalled();
  });
});
