jest.mock("../../src/utils/feature.flag");
import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PATH, DIRECTOR_PROTECTED_DETAILS_PATH, DIRECTOR_RESIDENTIAL_ADDRESS_PATH, urlParams } from '../../src/types/page.urls';
import { isActiveFeature } from "../../src/utils/feature.flag";
import { Request, Response } from "express";
import { get } from "../../src/controllers/director.residential.address.search.controller";
import { Session } from "@companieshouse/node-session-handler";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);

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

const mockNext = jest.fn();

describe("Director name controller tests", () => {

  beforeEach(() => {
    mocks.mockSessionMiddleware.mockClear();
  });

  describe("get tests", () => {

    it("Should navigate to director address page", async () => {
      const response = await request(app).get(PAGE_URL);
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
    });

    it("Should navigate to error page when feature flag is off", async () => {
      mockIsActiveFeature.mockReturnValueOnce(false);
      const response = await request(app).get(PAGE_URL);

      expect(response.text).toContain(ERROR_PAGE_HEADING);
    });

    it(`catch error when rendering ${PAGE_URL} page`, () => {
      const error = new TypeError("Cannot read properties of undefined (reading 'companyNumber')");

      (mockRes.render as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });

      get(mockReq, mockRes, mockNext);
      expect(mockNext).toBeCalledTimes(1);
      expect(mockNext).toBeCalledWith(error);
      expect(mockNext).toReturnTimes(1);

  });

  describe("post tests", () => {

    it(`Should render where director lives page if no radio button is selected`, async () => {
      const response = (await request(app).post(PAGE_URL).send({}));
      expect(response.text).toContain("Select the address where the director lives");
      expect(response.text).toContain(PAGE_HEADING);
      expect(response.text).toContain(PUBLIC_REGISTER_INFORMATION);
    });

    it(`should redirect to ${DIRECTOR_PROTECTED_DETAILS_PATH} page if service address is selected`, async () => {
      const response = (await request(app).post(PAGE_URL).send({ director_address: "director-different-address" }));
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