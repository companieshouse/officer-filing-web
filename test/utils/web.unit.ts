jest.mock("../../src/services/officer.filing.service");
jest.mock("../../src/services/company.appointments.service");

import mocks from "../mocks/all.middleware.mock";
import { APPOINT_DIRECTOR_CHECK_ANSWERS_PATH, APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END, UPDATE_DIRECTOR_CHECK_ANSWERS_END, UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, urlParams } from '../../src/types/page.urls';
import { urlUtils } from "../../src/utils/url";
import {
  setBackLink,
  getAddressOptions,
  getCountryFromKey,
  getDirectorNameBasedOnJourney,
  getField,
  setRedirectLink,
  addCheckYourAnswersParamToLink
} from "../../src/utils/web";
import { Request } from 'express';
import { patchOfficerFiling } from "../../src/services/officer.filing.service";
import { getCompanyAppointmentFullRecord } from "../../src/services/company.appointments.service";

const mockPatchOfficerFiling = patchOfficerFiling as jest.Mock;
const mockGetCompanyAppointmentFullRecord = getCompanyAppointmentFullRecord as jest.Mock;
const mockSession: any = {
  data: {},
  get: () => { },
  getExtraData: () => { },
  setExtraData: () => { }
};

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

    it('should return the URL to appoint cya if checkYourAnswersLink ends with appoint cya link with localisation', async () => {
      const req = {params: {}, query: {}} as Request;
      req.query.lang = "en"
      const checkYourAnswersLink = '/some-link' + APPOINT_DIRECTOR_CHECK_ANSWERS_PATH_END;
      const redirectLink = '/home';

      const result = setBackLink(req, checkYourAnswersLink, redirectLink, req.query.lang);
      expect(result).toBe(urlUtils.getUrlToPath(checkYourAnswersLink+"?lang=en", req));
    });

    it('should return the URL to update cya if checkYourAnswersLink ends with update cya link', async () => {
      const req = {params: {}} as Request;
      const checkYourAnswersLink = '/some-link' + UPDATE_DIRECTOR_CHECK_ANSWERS_END;
      const redirectLink = '/home';
  
      const result = await setRedirectLink(req, checkYourAnswersLink, redirectLink);
  
      expect(result).toBe(urlUtils.getUrlToPath(UPDATE_DIRECTOR_CHECK_ANSWERS_PATH, req));
    });

    it('should return the URL to update cya if checkYourAnswersLink ends with update cya link with localisation', async () => {
      const req = {params: {}, query: {}} as Request;
      req.query.lang = "en"
      const checkYourAnswersLink = '/some-link' + UPDATE_DIRECTOR_CHECK_ANSWERS_END;
      const redirectLink = '/home';

      const result = setBackLink(req, checkYourAnswersLink, redirectLink, req.query.lang);

      expect(result).toBe(urlUtils.getUrlToPath(checkYourAnswersLink+"?lang=en", req));
    });

    it('should return the URL to redirect link if checkYourAnswersLink is undefined with localisation', async () => {
      const req = {params: {}, query: {}} as Request;
      req.query.lang = "en"
      const checkYourAnswersLink = undefined;
      const redirectLink = '/home';

      const result = setBackLink(req, checkYourAnswersLink, redirectLink, req.query.lang);

      expect(result).toBe(urlUtils.getUrlToPath(redirectLink+"?lang=en", req));
    });
  });

  describe('getDirectorNameBasedOnJourney', () => {
    it('should retrieve director name from appointment if isUpdate is true', async () => {
      const mockReq: Request = {} as Request;
      mockReq.params = { PARAM_COMPANY_NUMBER: "12345678" };

      const mockOfficerFiling = {
        referenceAppointmentId: '123',
        firstName: "Peter",
        lastName: "Parker"
      };

      mockGetCompanyAppointmentFullRecord.mockResolvedValueOnce({
        etag: "etag",
        forename: "John",
        otherForenames: "mid",
        surname: "Smith"
      });

      const result = await getDirectorNameBasedOnJourney(true, mockSession, mockReq, mockOfficerFiling);
      expect(result).toBe('John mid Smith');
    });
  

    it('should retrieve director name from filing if isUpdate is false', async () => {
      const mockReq: Request = {} as Request;
      const mockOfficerFiling = {
        referenceAppointmentId: '123',
        firstName: "John",
        lastName: "Doe"
      };

      const result = await getDirectorNameBasedOnJourney(false, mockSession, mockReq, mockOfficerFiling);
      expect(result).toBe('John Doe');
    });
  });


describe('getAddressOptions', () => {
  it('should return an array of address options', () => {
    const ukAddresses = [
      {
        premise: '123',
        addressLine1: 'Main Street',
        addressLine2: 'Apt 4',
        postTown: 'London',
        country: 'GB-ENG',
        postcode: 'SW1A 1AA'
      },
      {
        premise: '456',
        addressLine1: 'High Street',
        postTown: 'Manchester',
        country: 'GB-ENG',
        postcode: 'M1 1AA'
      }
    ];

    const expectedOptions = [
      {
        premises: '123',
        formattedAddress: '123 Main Street, Apt 4, London, England, SW1A 1AA'
      },
      {
        premises: '456',
        formattedAddress: '456 High Street, Manchester, England, M1 1AA'
      }
    ];

    const result = getAddressOptions(ukAddresses);

    expect(result).toEqual(expectedOptions);
  });
});

describe('addCheckYourAnswersParamToLink', () => {
  it('should add cya_backlink parameter with ? if URL does not contain ?', () => {
    const url = 'http://example.com';
    const result = addCheckYourAnswersParamToLink(url);
    expect(result).toBe('http://example.com?cya_backlink=true');
  });

  it('should add cya_backlink parameter with & if URL already contains ?', () => {
    const url = 'http://example.com?param=value';
    const result = addCheckYourAnswersParamToLink(url);
    expect(result).toBe('http://example.com?param=value&cya_backlink=true');
  });
});