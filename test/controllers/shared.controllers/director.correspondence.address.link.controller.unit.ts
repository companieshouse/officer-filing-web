jest.mock("../../../src/utils/feature.flag")
jest.mock("../../../src/services/officer.filing.service");
jest.mock("../../../src/services/company.appointments.service");

import mocks from "../../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../../src/app";
import { getOfficerFiling, patchOfficerFiling } from "../../../src/services/officer.filing.service";

import { 
  urlParams, 
  DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH,
  DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH,
  UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH,
  DIRECTOR_CORRESPONDENCE_ADDRESS_PATH,
  UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
} from "../../../src/types/page.urls";
import { isActiveFeature } from "../../../src/utils/feature.flag";
import { getCompanyAppointmentFullRecord } from "../../../src/services/company.appointments.service";
import { validCompanyAppointmentResource } from "../../mocks/company.appointment.mock";
import { Session } from "@companieshouse/node-session-handler";

const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const mockGetOfficerFiling = getOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";
const PAGE_HEADING = "If the registered office address changes in the future, do you want this to apply to the director&#39;s correspondence address too?";
const ERROR_PAGE_HEADING = "Sorry, there is a problem with this service";
const SA_TO_ROA_ERROR = "Select yes if the registered office address changes in the future, and you want this to apply to your correspondence address too";

const PAGE_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_PAGE_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_LINK_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const NEXT_PAGE_URL = DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const UPDATE_NEXT_PAGE_URL = UPDATE_DIRECTOR_RESIDENTIAL_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
const BACK_LINK_URL = DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);
  const UPDATE_BACK_LINK_URL = UPDATE_DIRECTOR_CORRESPONDENCE_ADDRESS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID)
  .replace(`:${urlParams.PARAM_SUBMISSION_ID}`, SUBMISSION_ID);


describe("Director correspondence address link controller tests", () => {

    beforeEach(() => {
      mocks.mockSessionMiddleware.mockClear();
      mockGetOfficerFiling.mockClear();
      mockGetCompanyAppointmentFullRecord.mockClear();
      mockPatchOfficerFiling.mockClear();
    });
  
    describe("get tests", () => {
  
      it.each([[PAGE_URL, BACK_LINK_URL],[UPDATE_PAGE_URL, UPDATE_BACK_LINK_URL]])("Should navigate to correspondence address link page with no radio buttons selected", async (url, backLinkUrl) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer"
        })
        
        if(url === UPDATE_PAGE_URL){
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource.resource);
        }
        const response = await request(app).get(url);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(response.text).toContain(backLinkUrl);
        if(url === UPDATE_PAGE_URL){
          expect(response.text).toContain("John Elizabeth Doe");
        }
        else{
          expect(response.text).toContain("Testfirst Testmiddle Testlast");
        }
        expect(response.text).toContain('value="sa_to_roa_yes" aria-describedby');
        expect(response.text).toContain('value="sa_to_roa_no" aria-describedby');
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should navigate to correspondence address link page with yes radio selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: true
        })
        
        if(url === UPDATE_PAGE_URL){
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource);
        }
        const response = await request(app).get(url);
  
        expect(response.text).toContain('value="sa_to_roa_yes" checked');
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should navigate to correspondence address link page with no radio selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          title: "testTitle",
          firstName: "testFirst",
          middleNames: "testMiddle",
          lastName: "testLast",
          formerNames: "testFormer",
          isServiceAddressSameAsRegisteredOfficeAddress: false
        })

        if(url === UPDATE_PAGE_URL){
          mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource);
        }

        const response = await request(app).get(url);
        
        expect(response.text).toContain('value="sa_to_roa_no" checked');
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

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should return undefined when saToRoa is undefined", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          isServiceAddressSameAsRegisteredOfficeAddress: null
        });

        const response = await request(app).get(url);

        expect(response.text).not.toContain('value="sa_to_roa_no" checked');
        expect(response.text).not.toContain('value="sa_to_roa_yes" checked');
      });

    });

    describe("post tests", () => {

      it.each([[UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("should mark service address updated if link value changes", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456",
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({serviceAddressIsSameAsRegisteredOfficeAddress: false});
        const response = await request(app).post(url).send({"sa_to_roa": "sa_to_roa_yes"});

        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.any(Session), TRANSACTION_ID, SUBMISSION_ID, 
        {isServiceAddressSameAsRegisteredOfficeAddress: true, correspondenceAddressHasBeenUpdated: true})
        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("should not mark service address updated if link value remains the same", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456",
          serviceAddress: validCompanyAppointmentResource.resource?.serviceAddress
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({serviceAddressIsSameAsRegisteredOfficeAddress: true});
        const response = await request(app).post(url).send({"sa_to_roa": "sa_to_roa_yes"});

        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.any(Session), TRANSACTION_ID, SUBMISSION_ID, 
        {isServiceAddressSameAsRegisteredOfficeAddress: true})
        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("should mark service address as not updated if link and service address match company appointments value", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456",
          serviceAddress: validCompanyAppointmentResource.resource?.serviceAddress
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({serviceAddress: validCompanyAppointmentResource.resource?.serviceAddress, serviceAddressIsSameAsRegisteredOfficeAddress: false});
        const response = await request(app).post(url).send({"sa_to_roa": "sa_to_roa_no"});

        expect(mockPatchOfficerFiling).toHaveBeenCalledWith(expect.any(Session), TRANSACTION_ID, SUBMISSION_ID, 
        {isServiceAddressSameAsRegisteredOfficeAddress: false, correspondenceAddressHasBeenUpdated: false})
        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("should catch error", async (url) => {
        mockGetOfficerFiling.mockRejectedValueOnce(new Error("Error getting officer filing"));
        const response = await request(app).post(url);
        expect(response.text).toContain(ERROR_PAGE_HEADING)
      });

      it.each([[PAGE_URL, NEXT_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("should redirect to director residential address page when yes radio selected", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456"
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource);
        const response = await request(app).post(url).send({"sa_to_roa": "sa_to_roa_yes"});

        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      });

      it.each([[PAGE_URL, NEXT_PAGE_URL],[UPDATE_PAGE_URL, UPDATE_NEXT_PAGE_URL]])("should redirect to director residential address page when no radio selected", async (url, redirectLink) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          referenceAppointmentId: "123456"
        })
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource);
        const response = await request(app).post(url).send({"sa_to_roa": "sa_to_roa_no"});

        expect(response.text).toContain("Found. Redirecting to " + redirectLink);
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("should display an error when no radio button is selected", async (url) => {
        mockGetOfficerFiling.mockResolvedValueOnce({
          directorName: "Test Director"
        })

        const response = await request(app).post(url);
        expect(response.text).toContain(SA_TO_ROA_ERROR);
      });

      it.each([[PAGE_URL],[UPDATE_PAGE_URL]])("Should return undefined when sa_to_roa is not 'yes' or 'no'", async (url) => {
        const response = await request(app).post(url).send({"sa_to_roa": "notYesOrNo"});
      
        expect(response.text).not.toContain('value="sa_to_roa_no" checked');
        expect(response.text).not.toContain('value="sa_to_roa_yes" checked');
      });
    });
});
