jest.mock("../../src/middleware/company.authentication.middleware");
jest.mock("../../src/services/active.directors.details.service");
jest.mock("../../src/services/company.profile.service");
jest.mock("../../src/services/company.appointments.service");
jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/utils/api.enumerations");
jest.mock("../../src/utils/feature.flag");

import mocks from "../mocks/all.middleware.mock";
import request from "supertest";
import app from "../../src/app";

import { CURRENT_DIRECTORS_PATH, urlParams } from "../../src/types/page.urls";
import { companyAuthenticationMiddleware } from '../../src/middleware/company.authentication.middleware';
import { mockCompanyOfficerMissingAppointedOn, mockCompanyOfficersExtended } from "../mocks/active.director.details.mock";
import { validCompanyProfile, validPublicCompanyProfile } from "../mocks/company.profile.mock";
import { getListActiveDirectorDetails } from "../../src/services/active.directors.details.service";
import { getCompanyProfile } from "../../src/services/company.profile.service";
import { postOfficerFiling } from "../../src/services/officer.filing.service";
import { isActiveFeature } from "../../src/utils/feature.flag";
import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";
import { validCompanyAppointment, validCompanyAppointmentResource } from "../mocks/company.appointment.mock";
import { FILING_DESCRIPTION } from "../../src/utils/constants";

const mockCompanyAuthenticationMiddleware = companyAuthenticationMiddleware as jest.Mock;
mockCompanyAuthenticationMiddleware.mockImplementation((req, res, next) => next());
const mockGetCompanyOfficers = getListActiveDirectorDetails as jest.Mock;
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
mockGetCompanyOfficers.mockResolvedValue(mockCompanyOfficersExtended);
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
const mockPostOfficerFiling = postOfficerFiling as jest.Mock;
const mockIsFeatureFlag = isActiveFeature as jest.Mock;

const COMPANY_NUMBER = "12345678";
const APPOINTMENT_ID = "987654321";
const SUBMISSION_ID = "55555555";
const TRANSACTION_ID = "11223344";
const PAGE_HEADING = "Test Company";
const NO_DIRECTORS_PRIVATE_WARNING = "This company has no directors. This means it is not compliant and at risk of enforcement action. The company must appoint at least one director who is a person and tell Companies House within 14 days, or risk prosecution."
const NO_DIRECTORS_PRIVATE_WARNING_WELSH = "Nid oes unrhyw gyfarwyddwyr gan y cwmni hwn. Mae hyn yn golygu nad yw&#39;n cydymffurfio ac mewn perygl o weithred gorfodi. Rhaid i&#39;r cwmni benodi o leiaf un cyfarwyddwr sy&#39;n berson a dweud wrth Dŷ&#39;r Cwmnïau o fewn 14 diwrnod, neu fentro erlyniad."
const NO_DIRECTORS_PUBLIC_WARNING = "This company has no directors, or not enough directors. This means it is not compliant and at risk of enforcement action. The company must appoint at least 2 directors, and at least one must be a person. The company must tell Companies House who they&#39;ve appointed within 14 days, or risk prosecution."
const NO_DIRECTORS_PUBLIC_WARNING_WELSH = "Nid oes unrhyw gyfarwyddwyr, neu ddim digon o gyfarwyddwyr gan y cwmni hwn. Mae hyn yn golygu nad yw&#39;n cydymffurfio ac mewn perygl o weithred gorfodi. Rhaid i&#39;r cwmni benodi o leiaf 2 gyfarwyddwr, a rhaid i o leiaf un bod yn berson. Rhaid i&#39;r cwmni ddweud wrth Dŷ&#39;r Cwmnïau pwy maen nhw wedi&#39;i benodi o fewn 14 diwrnod, neu fentro erlyniad."
const mockIsActiveFeature = isActiveFeature as jest.Mock;
mockIsActiveFeature.mockReturnValue(true);
const ACTIVE_DIRECTOR_DETAILS_URL = CURRENT_DIRECTORS_PATH.replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER).replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID);
const NO_DIRECTORS_REDIRECT = "Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=no%20directors";
const CURRENT_DIRECTORS_URL = CURRENT_DIRECTORS_PATH
  .replace(`:${urlParams.PARAM_COMPANY_NUMBER}`, COMPANY_NUMBER)
  .replace(`:${urlParams.PARAM_TRANSACTION_ID}`, TRANSACTION_ID);

describe("Active directors controller tests", () => {

  beforeEach(() => {
    mocks.mockAuthenticationMiddleware.mockClear();
    mocks.mockCreateSessionMiddleware.mockClear();
    mockGetCompanyOfficers.mockClear();
    mockGetCompanyProfile.mockClear();
    mockPostOfficerFiling.mockClear();
    mockIsFeatureFlag.mockClear();
    mockGetCompanyAppointmentFullRecord.mockClear();
  });

  describe('localisation tests', () => {
    const mockRequest = {
      query: {
        lang: "en"
      }
    };

    it("Should display active non-corporate directors in welsh", async () => {
      mockRequest.query.lang = "cy"
      const response = (await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL).query(mockRequest.query));
      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("JANE");
      expect(response.text).toContain("ALICE");
      expect(response.text).toContain("SMITH");
      expect(response.text).toContain("Cyfarwyddwr");
      expect(response.text).toContain("Dyddiad geni");
      expect(response.text).toContain("Rhagfyr 2001");
      expect(response.text).toContain("Dyddiad penodi");
      expect(response.text).toContain("11 Mai 2019");
    }); 
    
    it("Should display active non-corporate directors in english", async () => {
      mockRequest.query.lang = "en"
      const response = (await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL).query(mockRequest.query));
      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("JANE");
      expect(response.text).toContain("ALICE");
      expect(response.text).toContain("SMITH");
      expect(response.text).toContain("Director");
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("December 2001");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("11 May 2019");
    });
  });

  describe("get tests", () => {

    it("Should navigate to current directors page", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(PAGE_HEADING);
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
    });

    it("Should navigate to current directors paginated pages", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL + "?page=2");

      expect(response.text).toContain(PAGE_HEADING);
    });

    it("Should display active non-corporate directors", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("JANE");
      expect(response.text).toContain("ALICE");
      expect(response.text).toContain("SMITH");
      expect(response.text).toContain("Director");
      expect(response.text).toContain("Date of birth");
      expect(response.text).toContain("December 2001");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("11 May 2019");
    });

    it("Should display active non-corporate nominee directors", async () => {
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);
  
        expect(mockGetCompanyOfficers).toHaveBeenCalled();
        expect(response.text).toContain("BETTY");
        expect(response.text).toContain("WHITE");
        expect(response.text).toContain("Director");
        expect(response.text).toContain("Date of birth");
        expect(response.text).toContain("December 2001");
        expect(response.text).toContain("Date appointed");
        expect(response.text).toContain("1 April 2016");
      });

    it("Should display active corporate directors", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL + "?page=2");

      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("BIG CORP");
      expect(response.text).toContain("Director");
      expect(response.text).toContain("Date appointed");
      expect(response.text).toContain("3 November 2020");
    });

    it("Should display active corporate nominee directors", async () => {
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL + "?page=2");
        expect(mockGetCompanyOfficers).toHaveBeenCalled();
        expect(response.text).toContain("BIGGER CORP 2");
        expect(response.text).toContain("Director");
        expect(response.text).toContain("Date appointed");
        expect(response.text).toContain("13 August 2022");
      });

      it("Should display a maximum of 5 directors on a page", async () => {
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);
  
        expect(response.text).toContain(PAGE_HEADING);
        expect(mockGetCompanyOfficers).toHaveBeenCalled();
        expect(response.text.match(/Remove director/g) || []).toHaveLength(5);
      });  

      it("Should show appointed before 1992 if appointed on date is missing", async () => {
        mockGetCompanyOfficers.mockResolvedValue([mockCompanyOfficerMissingAppointedOn]);
        const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);
        expect(response.text).toContain("Date appointed");
        expect(response.text).toContain("Before 1992");
      });

    it("Should display View and update Director button when CH01 is enabled", async () => {
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).toContain("View and update details");
    });

    it("Should not display View and update Director button when CH01 is disabled", async () => {
      mockIsFeatureFlag.mockReturnValue(false);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(mockGetCompanyOfficers).toHaveBeenCalled();
      expect(response.text).not.toContain("View and update details");
    });

    it("Should show warning for insufficient number of directors for a private company", async () => {
      mockGetCompanyOfficers.mockResolvedValue([]);
      mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(NO_DIRECTORS_PRIVATE_WARNING);
    });

    it("Should show warning for insufficient number of directors for a private company in welsh", async () => {
      mockGetCompanyOfficers.mockResolvedValue([]);
      mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL + "?lang=cy");

      expect(response.text).toContain(NO_DIRECTORS_PRIVATE_WARNING_WELSH);
    });

    it("Should show warning for insufficient number of directors for a public company", async () => {
      mockGetCompanyOfficers.mockResolvedValue([]);
      mockGetCompanyProfile.mockResolvedValue(validPublicCompanyProfile);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL);

      expect(response.text).toContain(NO_DIRECTORS_PUBLIC_WARNING);
    });

    it("Should show warning for insufficient number of directors for a public company in welsh", async () => {
      mockGetCompanyOfficers.mockResolvedValue([]);
      mockGetCompanyProfile.mockResolvedValue(validPublicCompanyProfile);
      const response = await request(app).get(ACTIVE_DIRECTOR_DETAILS_URL + "?lang=cy");

      expect(response.text).toContain(NO_DIRECTORS_PUBLIC_WARNING_WELSH);
    });
  });

  describe("post tests", () => {

    it("Should post filing and redirect to next page TM01", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointmentResource);
      mockPostOfficerFiling.mockReturnValueOnce({
        id: SUBMISSION_ID
      });

      const response = await request(app)
        .post(ACTIVE_DIRECTOR_DETAILS_URL)
        .send({ "removeAppointmentId": APPOINTMENT_ID });

        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/date-director-removed");
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockPostOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, expect.objectContaining({
          description: FILING_DESCRIPTION.REMOVE_DIRECTOR,
          referenceAppointmentId: APPOINTMENT_ID
        }));
    });

    it("Should post and redirect to next page AP01", async () => {
      mockPostOfficerFiling.mockResolvedValueOnce({
        id: SUBMISSION_ID,
      });

      const response = await request(app)
        .post(CURRENT_DIRECTORS_URL);

        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/director-name");
        expect(mockGetCompanyAppointmentFullRecord).not.toHaveBeenCalled();
        expect(mockPostOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, expect.objectContaining({
          description: FILING_DESCRIPTION.APPOINT_DIRECTOR
        }));
    });

    it ("should redirect to stop page if officer is secure officer", async() => {
        mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
          ...validCompanyAppointment,
          isSecureOfficer: true
        });
        const response = await request(app).post(CURRENT_DIRECTORS_URL)
        .send({"updateAppointmentId": APPOINTMENT_ID});
        expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
        expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
        expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
        expect(mockPostOfficerFiling).not.toHaveBeenCalled();
        expect(response.text).toContain("/appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=secure-officer&lang=en");
    });

    it ("should redirect to stop page if officer is secure officer in welsh", async() => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        ...validCompanyAppointment,
        isSecureOfficer: true
      });
      const response = await request(app).post(CURRENT_DIRECTORS_URL+"?lang=cy")
      .send({"updateAppointmentId": APPOINTMENT_ID});
      expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
      expect(mockPostOfficerFiling).not.toHaveBeenCalled();
      expect(response.text).toContain("/appoint-update-remove-company-officer/company/12345678/cannot-use?stopType=secure-officer&lang=cy");
  });

    it("Should post filing and redirect to next page CH01", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointment);
      mockPostOfficerFiling.mockReturnValueOnce({
        id: SUBMISSION_ID
      });

      const response = await request(app)
        .post(CURRENT_DIRECTORS_URL)
        .send({"updateAppointmentId": APPOINTMENT_ID});

      expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/update-director-details");
      expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
      expect(mockPostOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, expect.objectContaining({
        referenceAppointmentId: APPOINTMENT_ID,
        referenceEtag: "etag",
        title: "Mr",
        firstName: "John",
        middleNames: "Elizabeth",
        lastName: "Doe",
        formerNames: "John Smith, Old Macdonald",
        dateOfBirth: "2001-02-01",
        appointedOn: "2019-05-11",
        occupation: "Software Engineer",
        nationality1: "British",
        nationality2: "American",
        nationality3: "Canadian",
        serviceAddress: {
          premises: "premises 1",
          addressLine1: "address line 1",
          addressLine2: "address line 2",
          locality: "locality 1",
          region: "region 1",
          country: "UK",
          postalCode: "postal code 1",
        },
        residentialAddress: {
          premises: "premises 01",
          addressLine1: "address line 01",
          addressLine2: "address line 02",
          locality: "locality 2",
          region: "region 2",
          country: "England",
          postalCode: "postal code 2",
        },
        nameHasBeenUpdated: false,
        nationalityHasBeenUpdated: false,
        occupationHasBeenUpdated: false,
        serviceAddressHasBeenUpdated: false,
        residentialAddressHasBeenUpdated: false
      }));
    });

    it("Should post filing and set initial isServiceAddressSameAsRegisteredOfficeAddress", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce(validCompanyAppointment);
      mockPostOfficerFiling.mockReturnValueOnce({
        id: SUBMISSION_ID
      });

      const response = await request(app)
        .post(CURRENT_DIRECTORS_URL)
        .send({"updateAppointmentId": APPOINTMENT_ID});

      expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/update-director-details");
      expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
      expect(mockPostOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, expect.objectContaining({
        isServiceAddressSameAsRegisteredOfficeAddress: true,
        directorServiceAddressChoice: "director_registered_office_address",
        isHomeAddressSameAsServiceAddress: undefined,
        directorResidentialAddressChoice: "director_different_address"
      }));
    })

    it("Should post filing and set initial isHomeAddressSameAsServiceAddress", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({ 
        ...validCompanyAppointment, 
        serviceAddressIsSameAsRegisteredOfficeAddress: false,
        residentialAddressIsSameAsServiceAddress: true
      });
      mockPostOfficerFiling.mockReturnValueOnce({
        id: SUBMISSION_ID
      });

      const response = await request(app)
        .post(CURRENT_DIRECTORS_URL)
        .send({"updateAppointmentId": APPOINTMENT_ID});

      expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/update-director-details");
      expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
      expect(mockPostOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, expect.objectContaining({
        isServiceAddressSameAsRegisteredOfficeAddress: false,
        directorServiceAddressChoice: "director_different_address",
        isHomeAddressSameAsServiceAddress: true,
        directorResidentialAddressChoice: "director_correspondence_address"
      }));
    });

    it("Should post filing and redirect to next page CH01 with blank value for occupation", async () => {
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({ 
        ...validCompanyAppointment,
        occupation: "None"
      });
      mockPostOfficerFiling.mockReturnValueOnce({
        id: SUBMISSION_ID
      });

      const response = await request(app)
        .post(CURRENT_DIRECTORS_URL)
        .send({"updateAppointmentId": APPOINTMENT_ID});

      expect(mocks.mockAuthenticationMiddleware).toHaveBeenCalled();
      expect(mocks.mockCompanyAuthenticationMiddleware).toHaveBeenCalled();
      expect(response.text).toContain("Found. Redirecting to /appoint-update-remove-company-officer/company/12345678/transaction/11223344/submission/55555555/update-director-details");
      expect(mockGetCompanyAppointmentFullRecord).toHaveBeenCalled();
      expect(mockPostOfficerFiling).toHaveBeenCalledWith(expect.anything(), TRANSACTION_ID, expect.objectContaining({
        description: FILING_DESCRIPTION.UPDATE_DIRECTOR,
        occupation: "",
      }));
    });
  });
});
