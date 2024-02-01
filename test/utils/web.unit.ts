jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.appointments.service");

import mocks from "../mocks/all.middleware.mock";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END, UPDATE_DIRECTOR_CHECK_ANSWERS_END, UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from "../../src/types/page.urls";
import { urlUtils } from "../../src/utils/url";
import { getCountryFromKey, getDirectorNameBasedOnJourney, getField, setRedirectLink } from "../../src/utils/web";
import { Request } from 'express';
import { patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";
import { retrieveDirectorNameFromAppointment, retrieveDirectorNameFromFiling } from "../../src/utils/format";

const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;

const COMPANY_NUMBER = "12345678";
const TRANSACTION_ID = "11223344";
const SUBMISSION_ID = "55555555";

beforeEach(() => {
  mocks.mockSessionMiddleware.mockClear();
  mockPatchOfficerFiling.mockClear();
});

describe('getField', () => {
  it('should return the value of the specified field if it exists and is not empty', () => {
      const req: Request = { body: { name: 'John Doe' } } as Request;
      const fieldName = 'name';
      const result = getField(req, fieldName);
      expect(result).toEqual('John Doe');
  });

  it('should return an empty string if the specified field does not exist', () => {
      const req: Request = { body: {} } as Request;
      const fieldName = 'name';
      const result = getField(req, fieldName);
      expect(result).toEqual('');
  });

  it('should return an empty string if the specified field is empty', () => {
      const req: Request = { body: { name: '' } } as Request;
      const fieldName = 'name';
      const result = getField(req, fieldName);
      expect(result).toEqual('');
  });

  it('should not return null if the specified field is empty', () => {
      const req: Request = { body: { name: '' } } as Request;
      const fieldName = 'name';
      const result = getField(req, fieldName);
      expect(result).not.toBeNull();
  });
});

describe('test getCountryFromKey', () => {
    it('should return Scotland for GB-SCT', () => {
      const result = getCountryFromKey('GB-SCT');
      expect(result).toEqual('Scotland');
    });
  
    it('should return Wales for GB-WLS', () => {
      const result = getCountryFromKey('GB-WLS');
      expect(result).toEqual('Wales');
    });
  
    it('should return England for GB-ENG', () => {
      const result = getCountryFromKey('GB-ENG');
      expect(result).toEqual('England');
    });
  
    it('should return Northern Ireland for GB-NIR', () => {
      const result = getCountryFromKey('GB-NIR');
      expect(result).toEqual('Northern Ireland');
    });
  
    it('should return Channel Island for Channel Island', () => {
      const result = getCountryFromKey('Channel Island');
      expect(result).toEqual('Channel Island');
    });
  
    it('should return Isle of Man for Isle of Man', () => {
      const result = getCountryFromKey('Isle of Man');
      expect(result).toEqual('Isle of Man');
    });
  
    it('should return undefined for an unknown country key', () => {
      const result = getCountryFromKey('unknown');
      expect(result).toBeUndefined();
    });
  });

describe('setRedirectLink', () => {
    it('should return the redirect link if checkYourAnswersLink is falsy', async () => {
      const req = {params: {}} as Request;
      const checkYourAnswersLink = undefined;
      const redirectLink = '/home';
  
      const result = await setRedirectLink(req, checkYourAnswersLink, redirectLink);
  
      expect(result).toBe(redirectLink);
    });
  
    it('should return the redirect link if checkYourAnswersLink does not end with appoint or update cya link', async () => {
      const req = {params: {}} as Request;
      const checkYourAnswersLink = '/some-link';
      const redirectLink = '/home';
  
      const result = await setRedirectLink(req, checkYourAnswersLink, redirectLink);
  
      expect(result).toBe(redirectLink);
    });
  
    it('should return the URL to appoint cya if checkYourAnswersLink ends with appoint cya link', async () => {
      const req = {params: {}} as Request;
      const checkYourAnswersLink = '/some-link' + APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END;
      const redirectLink = '/home';
  
      const result = await setRedirectLink(req, checkYourAnswersLink, redirectLink);
  
      expect(result).toBe(urlUtils.getUrlToPath(APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, req));
    });
  
    it('should return the URL to update cya if checkYourAnswersLink ends with update cya link', async () => {
      const req = {params: {}} as Request;
      const checkYourAnswersLink = '/some-link' + UPDATE_DIRECTOR_CHECK_ANSWERS_END;
      const redirectLink = '/home';
  
      const result = await setRedirectLink(req, checkYourAnswersLink, redirectLink);
  
      expect(result).toBe(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, req));
    });
  });

  describe('getDirectorNameBasedOnJourney', () => {
    it('should retrieve director name from appointment if isUpdate is true', async () => {
      const mockReq = {} as Request;
      const mockSession = {};
      const mockOfficerFiling = { referenceAppointmentId: '123' };
  
      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        forename: "John",
        otherForenames: "mid",
        surname: "Smith"
         });
      
      const result = await getDirectorNameBasedOnJourney(true, mockSession, mockReq, mockOfficerFiling);
  
      expect(getCompanyAppointmentFullRecord).toHaveBeenCalledWith(mockSession, urlUtils.getCompanyNumberFromRequestParams(mockReq), '123');
      expect(retrieveDirectorNameFromAppointment).toHaveBeenCalledWith('mockAppointment');
      expect(result).toBe('John mid Smith');
    });
  
    it('should retrieve director name from filing if isUpdate is false', async () => {
      const mockReq = {} as Request;
      const mockSession = {};
      const mockOfficerFiling = { 
        referenceAppointmentId: '123', 
        firstName: "John",
        lastName: "Doe",
        title: "Mr",
        occupation: "Director"
      };
      (retrieveDirectorNameFromFiling as jest.Mock).mockReturnValue('mockDirectorName');
  
      const result = await getDirectorNameBasedOnJourney(false, mockSession, mockReq, mockOfficerFiling);
  
      expect(retrieveDirectorNameFromFiling).toHaveBeenCalledWith(mockOfficerFiling);
      expect(result).toBe('John Doe');
    });
  });