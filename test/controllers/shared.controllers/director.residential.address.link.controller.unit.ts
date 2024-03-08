jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");
jest.mock("../../../src/utils/address");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";

import { 
  urlParams, 
  DIRECTOR_PROTECTED_DETAILS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
  APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH,
  UPDATE_DIRECTOR_DETAILS_PATH,
  UPDATE_DIRECTOR_CHECK_ANSWERS_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH
} from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { HA_TO_SA_ERROR } from "../../../src/utils/constants";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { validCompanyAppointmentResource } from "../../mocks/company.appointment.mock";
import { compareAddress } from "../../../src/utils/address";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockCompareAddress = compareAddress as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "If the director&#39;s correspondence address changes in the future, do you want this to apply to their home address too?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const PAGE_HEADING_WELSH = "Os bydd cyfeiriad gohebiaeth y cyfarwyddwr yn newid yn y dyfodol, a ydych chi am i hyn fod yn berthnasol i’w cyfeiriad cartref hefyd?";

const PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = DIRECTOR_PROTECTED_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_NEXT_PAGE_URL = UPDATE_DIRECTOR_DETAILS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const APPOINT_DIRECTORS_CYA_URL = APPOINT_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_DIRECTORS_CYA_URL = UPDATE_DIRECTOR_CHECK_ANSWERS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const BACK_LINK_URL = DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_BACK_LINK_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const PAGE_URL_WELSH = PAGE_URL + "?lang=cy";
const UPDATE_PAGE_URL_WELSH = UPDATE_PAGE_URL + "?lang=cy";
const NEXT_PAGE_URL_WELSH = NEXT_PAGE_URL + "?lang=cy";
const UPDATE_NEXT_PAGE_URL_WELSH = UPDATE_NEXT_PAGE_URL + "?lang=cy";
const APPOINT_DIRECTORS_CYA_URL_WELSH = APPOINT_DIRECTORS_CYA_URL + "?lang=cy";
const UPDATE_DIRECTORS_CYA_URL_WELSH = UPDATE_DIRECTORS_CYA_URL + "?lang=cy";
const BACK_LINK_URL_WELSH = BACK_LINK_URL + "?lang=cy";
const UPDATE_BACK_LINK_URL_WELSH = UPDATE_BACK_LINK_URL + "?lang=cy";
const HA_TO_SA_ERROR_WELSH = "Dewiswch Ydw os bydd cyfeiriad y swyddfa gofrestredig yn newid yn y dyfodol, ac rydych am i hyn fod yn berthnasol i&#39;ch cyfeiriad gohebiaeth hefyd"

describe("Director residential address link controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
      mockGetCompanyAppointmentFullRecord.mockClear();
      mockCompareAddress.mockClear();
    });
  
    describe("get tests", () => {
  
      it.each([[PAGE_URL, BACK_LINK_URL],[UPDATE_PAGE_URL, UPDATE_BACK_LINK_URL]])("Should navigate to residential address link page with no radio buttons selected", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          referenceAppointmentId: "123456"
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        const response = await request(app).get(url);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain(backLink);
        if(url === PAGE_URL){
          expect(response.text).toContain("Testfirst Testmiddle Testlast");
        } else {
          expect(response.text).toContain("John Elizabeth Doe");
        }
        expect(response.text).toContain('value="ha_to_sa_yes" aria-describedby');
        expect(response.text).toContain('value="ha_to_sa_no" aria-describedby');
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should navigate to residential address link page with yes radio selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isHomeAddressSameAsServiceAddress: true
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        
        const response = await request(app).get(url);
  
        expect(response.text).toContain('value="ha_to_sa_yes" checked');
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should navigate to residential address link page with no radio selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          referenceAppointmentId: "123456",
          isHomeAddressSameAsServiceAddress: false
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        
        const response = await request(app).get(url);
  
        expect(response.text).toContain('value="ha_to_sa_no" checked');
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should navigate to error page when feature flag is off", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should catch error when officer filing returned error ", async (url) => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
        
        const response = await request(app).get(url);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

    });

    describe("post tests", () => {
      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("should display an error when no radio button is selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          referenceAppointmentId: "123456"
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        
        const response = await request(app).post(url);
        expect(response.text).toContain(HA_TO_SA_ERROR);
        if(url === PAGE_URL){
          expect(response.text).toContain("Testfirst Testmiddle Testlast");
        } else {
          expect(response.text).toContain("John Elizabeth Doe");
        }
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("should catch error", async (url) => {
        const response = await request(app).post(url);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });
      it.each([[PAGE_URL, NEXT_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("should redirect to director protected details or director details page when yes radio selected", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          referenceAppointmentId: "123456",
          checkYourAnswersLink: undefined,
        })
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        const response = await request(app).post(url).send({"ha_to_sa": "ha_to_sa_yes"});

        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL, APPOINT_DIRECTORS_CYA_URL],[UPDATE_PAGE_URL, UPDATE_DIRECTORS_CYA_URL]])("should redirect to appoint directors check your answers page if CYA link is present", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          checkYourAnswersLink: APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
          referenceAppointmentId: "123456"
        })
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{ checkYourAnswersLink: "testLink"
        }});
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        const response = await request(app).post(url).send({"ha_to_sa": "ha_to_sa_yes"});

        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });

      it.each([[PAGE_URL, NEXT_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("should redirect to director protected details or director details page when no radio selected", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          referenceAppointmentId: "123456"
        })
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{
        }});
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        const response = await request(app).post(url).send({"ha_to_sa": "ha_to_sa_no"});

        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });
    });

    describe("Welsh language tests", () => {
      // get test
      it.each([[PAGE_URL_WELSH, BACK_LINK_URL_WELSH],[UPDATE_PAGE_URL_WELSH, UPDATE_BACK_LINK_URL_WELSH]])("Should navigate to residential address link page with selected lang", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          referenceAppointmentId: "123456"
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        const response = await request(app).get(url);

        expect(response.text).toContain(PAGE_HEADING_WELSH);
        expect(response.text).toContain(backLink);
        if(url === PAGE_URL_WELSH){
          expect(response.text).toContain("Testfirst Testmiddle Testlast");
        } else {
          expect(response.text).toContain("John Elizabeth Doe");
        }
        expect(response.text).toContain('value="ha_to_sa_yes" aria-describedby');
        expect(response.text).toContain('value="ha_to_sa_no" aria-describedby');
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      // post tests
      it.each([[PAGE_URL_WELSH],[UPDATE_PAGE_URL_WELSH]])("should display an error when no radio button is selected with selected lang", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer"
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);

        const response = await request(app).post(url);
        expect(response.text).toContain(HA_TO_SA_ERROR_WELSH);
      });

      it.each([[PAGE_URL_WELSH, NEXT_PAGE_URL_WELSH],[UPDATE_PAGE_URL_WELSH, UPDATE_NEXT_PAGE_URL_WELSH]])("should redirect to director protected details or director details page when yes radio selected with selected lang", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          checkYourAnswersLink: undefined,
          referenceAppointmentId: "123456"
        })
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        const response = await request(app).post(url).send({"ha_to_sa": "ha_to_sa_yes"});

        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL_WELSH, APPOINT_DIRECTORS_CYA_URL_WELSH],[UPDATE_PAGE_URL_WELSH, UPDATE_DIRECTORS_CYA_URL_WELSH]])("should redirect to appoint directors check your answers page if CYA link is present with selected lang", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          checkYourAnswersLink: APPOINT_DIRECTOR_CHECK_ANSWERS_PATH,
          referenceAppointmentId: "123456"
        })
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{ checkYourAnswersLink: "testLink" }});
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        const response = await request(app).post(url).send({"ha_to_sa": "ha_to_sa_yes"});

        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });

      it.each([[PAGE_URL_WELSH, NEXT_PAGE_URL_WELSH],[UPDATE_PAGE_URL_WELSH, UPDATE_NEXT_PAGE_URL_WELSH]])("should redirect to director protected details or director details page when no radio selected with selected lang", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          referenceAppointmentId: "123456"
        })
        mockPatchOfficerFiling.mockResolvedValueOnce({data:{}});
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        const response = await request(app).post(url).send({"ha_to_sa": "ha_to_sa_no"});

        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });
    })
});
