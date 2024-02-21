jest.mock("../../src/utils/feature.flag")
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/validation/protected.details.validation")

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";
import { Request } from "express";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../src/services/officer.filing.service";
import { buildValidationErrors } from "../../src/validation/protected.details.validation";
import { ValidationError } from "../../src/model/validation.model";
import { protectedDetailsErrorMessageKey } from "../../src/utils/api.enumerations.keys";

import { directorAppliedToProtectDetailsValue } from "../../src/controllers/director.protected.details.controller";
import { DirectorField } from "../../src/model/director.model";

import {
  DIRECTOR_PROTECTED_DETAILS_PATH,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
  DIRECTOR_CONFIRM_RESIDENTIAL_ADDRESS_PATH_END,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END,
  urlParams,
  DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH_END
} from "../../src/types/page.urls";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { check } from "yargs";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockBuildValidationErrors = buildValidationErrors as jest.Mock;
const mockDirectorAppliedToProtectDetailsValue = directorAppliedToProtectDetailsValue as jest.Mock;

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
    });
  
    describe("get tests", () => {

      it("Should navigate to director protected details page", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({})
        
        const response = await request(app).get(PAGE_URL).set({"referer": "protected-details"});
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("Should navigate to error page when feature flag is off", async () => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(PAGE_URL).set({"referer": "protected-details"});
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it(`Should populate back link to ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH} page if the flag isHomeAddressSameAsServiceAddress set to false`, async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          isHomeAddressSameAsServiceAddress : false
        });

        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END);
      });

      it(`should navigate back button to residential address home page if officerFiling.protectedDetailsBackLink includes ${DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END}`, async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          protectedDetailsBackLink: "/director-home-address",
          checkYourAnswersLink: ""
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END);
      });

      it("should navigate back button to residential address home page if officerFiling.protectedDetailsBackLink is undefined", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          protectedDetailsBackLink: undefined,
          checkYourAnswersLink: ""
        })
        const response = await request(app).get(PAGE_URL);

        expect(response.text).toContain(DIRECTOR_RESIDENTIAL_ADDRESS_PATH_END);
      });

      it("Should catch error when officer filing returned error ", async () => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
        
        const response = await request(app).get(PAGE_URL);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it("Should render the page in welsh", async () => {
       mockGetOfficerFiling.mockResolvedValueOnce({})

       const response = await request(app).get(PAGE_URL+ "?lang=cy").set({"referer": "protected-details"});

       expect(response.text).toContain("to be translated");
      });

      it('should set checkYourAnswersLink to empty string if ?cya_backlink=true', async () => {
        mockGetOfficerFiling.mockResolvedValue({});
        mockPatchOfficerFiling.mockResolvedValue({data:{
          firstName: "John",
          lastName: "Doe",
          checkYourAnswersLink: ""
        }});
        const response = await request(app).get(PAGE_URL + "?cya_backlink=true");
        expect(patchOfficerFiling).toHaveBeenCalled();
      });

    });

    describe("post tests", () => {
      it("should redirect to appoint director check answers page when there are no errors", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director"
        })
        mockBuildValidationErrors.mockReturnValueOnce([]);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

        const response = await request(app).post(PAGE_URL);

        expect(response.text).toContain("Found. Redirecting to " + NEXT_PAGE_URL);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it("should display an error when no radio button is selected", async () => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director"
        })
        
        let validationErrorsResponse: ValidationError[] = [
          {
            messageKey: protectedDetailsErrorMessageKey.NO_PROTECTED_DETAILS_RADIO_BUTTON_SELECTED,
            source: ['protected_details'],
            link: 'protected_details'
          }
        ];
        mockBuildValidationErrors.mockReturnValueOnce(validationErrorsResponse);
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});

        const response = await request(app).post(PAGE_URL);

        expect(response.text).toContain("Select whether the director has applied to protect their details at Companies House");
      });

      it("should catch error if patch officer filing failed", async () => {
        const mockPatchOfficerFilingResponse = {
        };
        mockPatchOfficerFiling.mockResolvedValueOnce(mockPatchOfficerFilingResponse);
        const response = (await request(app).post(PAGE_URL).send({}));
        expect(response.text).not.toContain(protectedDetailsErrorMessageKey.NO_PROTECTED_DETAILS_RADIO_BUTTON_SELECTED);
        expect(response.text).not.toContain(PAGE_HEADING);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });
    });

    describe("directorAppliedToProtectDetailsValue", () => {
      it("should return undefined if directorProtectedDetailsRadio is not defined", () => {
        const req = { body: {} } as Request;
        const result = mockDirectorAppliedToProtectDetailsValue(req);
        expect(result).toBeUndefined();
      });
    
      it("should return true if directorProtectedDetailsRadio is 'yes'", () => {
        const req = { body: { [DirectorField.PROTECTED_DETAILS_RADIO]: DirectorField.PROTECTED_DETAILS_YES } } as Request;
        const result = mockDirectorAppliedToProtectDetailsValue(req);
        expect(result).toBe(true);
      });
    
      it("should return false if directorProtectedDetailsRadio is 'no'", () => {
        const req = { body: { [DirectorField.PROTECTED_DETAILS_RADIO]: DirectorField.PROTECTED_DETAILS_NO } } as Request;
        const result = mockDirectorAppliedToProtectDetailsValue(req);
        expect(result).toBe(false);
      });
    
      it("should return undefined if directorProtectedDetailsRadio is not 'yes' or 'no'", () => {
        const req = { body: { [DirectorField.PROTECTED_DETAILS_RADIO]: "invalid" } } as Request;
        const result = mockDirectorAppliedToProtectDetailsValue(req);
        expect(result).toBeUndefined();
      });
    });
});
