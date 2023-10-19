jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import e, { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { buildValidationErrors } from "../../src/controllers/director.protected.details.controller";

import { 
  DIRECTOR_PROTECTED_DETAILS_PATH,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  urlParams 
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
// const mockBuildValidationErrors = buildValidationErrors as jest.Mock;
let mockBuildValidationErrors = jest.fn();
jest.mock("../../src/controllers/director.protected.details.controller", () => ({
  ...jest.requireActual("../../src/controllers/director.protected.details.controller"),
  buildValidationErrors: jest.fn(() => mockBuildValidationErrors)
}));

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "Does the director have their personal information protected at Companies House?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";

const PAGE_URL = DIRECTOR_PROTECTED_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

// const SOURCE_PAGE_1 = DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END
// .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
// .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
// .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
// const BACK_NAVIGATION_1 = DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH
// .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
// .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
// .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

// const SOURCE_PAGE_2 = DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END
// .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
// .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
// .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
// const BACK_NAVIGATION_2 = DIRECTOR_RESIDENTIAL_ADDRESS_PATH
// .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
// .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
// .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const mockReq = {
  session: {} as Session,
  headers: {},
  route: '',
  method: '',
  body: {
    protected_details: 'false'
  },
} as Request;

describe("Director protected details controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
      // mockBuildValidationErrors.mockClear();
    });
  
    describe("get tests", () => {
  
      it("Should navigate to director protected details page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({})
        
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {

      it("Should redirect to appoint director check answers page when there are no errors", async () => {

        // mockGetOfficerFiling.mockResolvedValueOnce({
        //   directorAppliedToProtectDetails: false,
        // });

        // buildValidationErrors(mockReq);

        // mockPatchOfficerFiling.mockResolvedValueOnce({
        //   data: {
        //     directorAppliedToProtectDetails: false,
        //   }
        // });

        // debugger;
        mockBuildValidationErrors.mockReturnValueOnce([]);

        const response = await request(app).post(PAGE_URL);

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
      });
    });
});
