jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { getOfficerFiling } from "../../../src/services/officer.filing.service";

import {
  urlParams,
  DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH,
  UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END
} from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { validCompanyAppointmentResource } from "../../mocks/company.appointment.mock";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyAppointmentFullRecord.mockResolvedValue(validCompanyAppointmentResource.resource);

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "If the registered office address changes in the future, do you want this to apply to the director&#39;s correspondence address too?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const SA_TO_ROA_ERROR = "Select yes if the registered office address changes in the future, and you want this to apply to your correspondence address too";

const APPOINT_PAGE_URL = DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const APPOINT_PAGE_URL_WELSH = APPOINT_PAGE_URL + "?lang=cy";
const APPOINT_NEXT_PAGE_ON_YES_URL = DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const APPOINT_NEXT_PAGE_ON_NO_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

const UPDATE_PAGE_URL = UPDATE_DIRECTOR_LINK_CORRESPONDENCE_ADDRESS_ENTER_MANUALLY_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL_WELSH = UPDATE_PAGE_URL + "?lang=cy";
const UPDATE_NEXT_PAGE_ON_YES_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_NEXT_PAGE_ON_NO_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_SEARCH_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);

describe("Director link correspondence address enter manually controller tests", () => {

    beforeEach(() => {
      mocks.mockCreateSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
      it.each([[APPOINT_PAGE_URL, DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END], [UPDATE_PAGE_URL, UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH_END]])
      ("Should navigate to '%s' page no radio buttons selected", async (url, backLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: undefined
        })
        
        const response = await request(app).get(url);
  
        expect(response.text).toContain(PAGE_HEADING);
        if(url == APPOINT_PAGE_URL) {
          expect(response.text).toContain("Testfirst Testmiddle Testlast");
        } else {
          expect(response.text).toContain("John Elizabeth Doe");
        }
        expect(response.text).toContain('value="sa_to_roa_yes"');
        expect(response.text).toContain('value="sa_to_roa_no"');
        expect(response.text).toContain(backLink);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should navigate '%s' page with yes radio selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        })
        
        const response = await request(app).get(url);
  
        expect(response.text).toContain('value="sa_to_roa_yes" checked');
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should navigate to '%s' page with no radio selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: false
        })
        
        const response = await request(app).get(url);
  
        expect(response.text).toContain('value="sa_to_roa_no" checked');
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should navigate to error page when feature flag is off", async (url) => {
        mockIsActiveFeature.mockReturnValueOnce(false);
        const response = await request(app).get(url);
  
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("Should catch error when officer filing returned error ", async (url) => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
        
        const response = await request(app).get(url);
        expect(response.text).toContain(ERROR_PAGE_HEADING);
      });


      it.each([APPOINT_PAGE_URL_WELSH, UPDATE_PAGE_URL_WELSH])
      ("Should display '%s' page in Welsh", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: false
        })
        const response = await request(app).get(url);
        expect(response.text).toContain("Os bydd cyfeiriad y swyddfa gofrestredig yn newid yn y dyfodol, a ydych chi am i hyn fod yn berthnasol i gyfeiriad gohebiaeth y cyfarwyddwr hefyd?");
      });
    });

    describe("post tests", () => {

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("should display an error when no radio button is selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          isServiceAddressSameAsRegisteredOfficeAddress: undefined
        })

        const response = await request(app).post(url);
        expect(response.text).toContain(SA_TO_ROA_ERROR);
      });

      it.each([APPOINT_PAGE_URL, UPDATE_PAGE_URL])
      ("should catch error", async (url) => {
        const response = await request(app).post(url);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it.each([[APPOINT_PAGE_URL, APPOINT_NEXT_PAGE_ON_YES_URL], [UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_ON_YES_URL]])
      ("should navigate to residential address search page when yes radio button is selected", async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          isServiceAddressSameAsRegisteredOfficeAddress: undefined
        })

        const response = await request(app).post(url).send({sa_to_roa: "sa_to_roa_yes"});
        expect(response.header.location).toContain(nextPageUrl);
      });

      it.each([[APPOINT_PAGE_URL, APPOINT_NEXT_PAGE_ON_NO_URL], [UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_ON_NO_URL]])
      ("should navigate to correspondence address page when no radio button is selected", async (url, nextPageUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director",
          isServiceAddressSameAsRegisteredOfficeAddress: undefined
        })

        const response = await request(app).post(url).send({sa_to_roa: "sa_to_roa_no"});
        expect(response.header.location).toContain(nextPageUrl);
      });
    });
});