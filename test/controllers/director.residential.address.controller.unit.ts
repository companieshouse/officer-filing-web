jest.mock("../../src/utils/feature.flag");
jest.mock("../../src/services/officer.filing.service")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PATH, DIRECTOR_PROTECTED_DETAILS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH, urlParams } from '../../src/types/page.urls';
import { isActiveFeature } from "../../src/utils/feature.flag";
import e, { Request, Response } from "express";
import { get } from "../../src/controllers/director.residential.address.search.controller";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockNext = jest.fn();

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Where does the director live?";
const PUBLIC_REGISTER_INFORMATION = "What information we'll show on the public register";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_PROTECTED_INFORMATION_PAGE_URL = DIRECTOR_PROTECTED_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL = DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const mockRes = {
  render: jest.fn() as any,
  redirect: jest.fn() as any,
} as Response;

const mockReq = {
  session: {} as Session,
  headers: {},
  route: '',
  method: '',
  body: {},
} as Request;

const directorNameMock = {
  firstName: "John",
  middleName: "NewLand",
  lastName: "Doe"
}
describe("Director name controller tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to director address page", async () => {
      mockGetOfficerFiling.mockResolvedValueOnce({
        ...directorNameMock
      });
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
    });

    it("Should navigate to error page when feature flag is off", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it(`catch error when rendering ${PAGE_URL} page`, () => {
      const error = new TypeError("Cannot read properties of undefined (reading 'transactionId')");

      (mockRes.render as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      get(mockReq, mockRes, mockNext.mockReturnValue(error));
      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
      expect(mockNext).toReturnWith(error);
    });

    it("should catch error if getofficerfiling error", async () => {
      const response = await request(app).get(PAGE_URL);
      expect(response.text).not.toContain(PAGE_HEADING);
      expect(response.text).toContain(ERROR_PAGE_HEADING)
    });
  });

  describe("post tests", () => {

    it(`Should render where director lives page if no radio button is selected`, async () => {
      const mockPatchOfficerFilingResponse = {
        data: {
          ...directorNameMock
        }
      };
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(PAGE_URL).send({}));
      expect(response.text).toContain("Select the address where the director lives");
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
      expect(response.text).toContain(directorNameMock.firstName);
      expect(mockPatchOfficerFiling).toHaveBeenCalled();
    });

    it("should catch error if patch officer filing failed", async () => {
      const mockPatchOfficerFilingResponse = {
      };
      mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
      const response = (await request(app).post(PAGE_URL).send({}));
      expect(response.text).not.toContain("Select the address where the director lives");
      expect(response.text).not.toContain(PAGE_HEADING);
      expect(response.text).toContain(ERROR_PAGE_HEADING)
    })

    it(`should redirect to ${DIRECTOR_PROTECTED_DETAILS_PATH} page if service address is selected`, async () => {
      const response = (await request(app).post(PAGE_URL).send({ director_address: "director_different_address" }));
      expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PAGE_URL);
    });

    it(`should redirect to ${DIRECTOR_PROTECTED_DETAILS_PATH} page if service address is selected`, async () => {
      const response = (await request(app).post(PAGE_URL).send({
        director_address: "director_service_address"
      }));

      expect(response.text).toContain("Found. Redirecting to " + DIRECTOR_PROTECTED_INFORMATION_PAGE_URL);
    });
  });
});