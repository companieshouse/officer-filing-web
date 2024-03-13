import mocks from '../mocks/all.middleware.mock';
import { Response } from "express";
import request from "supertest";
import app from "../../src/app";
import { ACCOUNTS_SIGNOUT_PATH, OFFICER_FILING, SIGNOUT_PATH } from "../../src/types/page.urls";
import { getPreviousPageUrl, safeRedirect } from '../../src/controllers/signout.controller';

const SIGNOUT_LOCATION = `${OFFICER_FILING}${SIGNOUT_PATH}`;

describe("Signout controller tests", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('get tests', () => {
    it("should render the signout template", async () => {
      const response = await request(app)
        .get(SIGNOUT_LOCATION)
        .set('Referer', 'http://example.com');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Are you sure you want to sign out?');
      expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it("should render the signout template in welsh", async () => {
      const response = await request(app)
        .get(SIGNOUT_LOCATION)
        .query({ lang: 'cy' })
        .set('Referer', 'http://example.com?lang=cy');

      expect(response.status).toBe(200);
      expect(response.text).toContain("Ydych chi'n siŵr eich bod eisiau allgofnodi?");
      expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
    });
  });

  describe('post tests', () => {
    it('should show an error if no radio buttons are selected', async () => {
      const response = await request(app)
        .post(SIGNOUT_LOCATION)

      expect(response.status).toBe(400)
      expect(response.text).toContain('Select yes if you want to sign out');
      expect(response.text).toContain('#signout');
      expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it('should show an error if no radio buttons are selected in welsh', async () => {
      const response = await request(app)
        .post(SIGNOUT_LOCATION + "?lang=cy")

      expect(response.status).toBe(400)
      expect(response.text).toContain("Dewiswch ydw os ydych am allgofnodi");
      expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it('return the user to their previous location if they select "no"', async () => {
      const response = await request(app)
        .post(SIGNOUT_LOCATION).send({ signout: 'no', previousPage: OFFICER_FILING + "/test" })

      expect(response.status).toBe(302);
      expect(response.text).toContain("Found. Redirecting to " + OFFICER_FILING + "/test");
      expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it('should direct to account signout if they select "yes"', async () => {
      const response = await request(app)
        .post(SIGNOUT_LOCATION)
        .send({ signout: 'yes' })

      expect(response.status).toBe(302)
      expect(response.get('Location')).toBe(ACCOUNTS_SIGNOUT_PATH + "?lang=en")
    });
  });

  describe('safeRedirect tests', () => {
    it('should redirect to the page if it is a valid page', () => {
      const res = {
        redirect: jest.fn()
      }
      const url = OFFICER_FILING + "/test"
      safeRedirect(res as any as Response, url)
      expect(res.redirect).toHaveBeenCalledWith(url)
    });

    it('should throw and not redirect to the page if it is not a valid page', () => {
      const res = {
        redirect: jest.fn()
      }
      const url = "http://example.com/test"
      
      expect(() => safeRedirect(res as any as Response, url)).toThrowError(new Error('Security failure with URL ' + url))
      expect(res.redirect).not.toHaveBeenCalled()
    });
  });

  describe('getPreviousPageUrl tests', () => {
    it('should return the previous page url', () => {
      const previousPage = OFFICER_FILING + '/test'
      const req = {
        rawHeaders: [
          'Host', 'localhost:3000',
          'User-Agent', 'curl/7.64.1',
          'Accept', '*/*',
          'Referer', previousPage
        ]
      }
      
      expect(getPreviousPageUrl(req as any)).toBe(previousPage)
    });
  });
});