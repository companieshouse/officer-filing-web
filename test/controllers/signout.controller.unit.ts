import mocks from '../mocks/all.middleware.mock';

import request from "supertest";
import app from "../../src/app";
import { ACCOUNTS_SIGNOUT_PATH, OFFICER_FILING, SIGNOUT_PATH } from "../../src/types/page.urls";
import { session } from '../mocks/session.middleware.mock';
import { SIGNOUT_RETURN_URL_SESSION_KEY } from '../../src/utils/constants';

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
        .query({lang: 'cy'})
        .set('Referer', 'http://example.com?lang=cy');

      expect(response.status).toBe(200);
      expect(response.text).toContain("Ydych chi'n siŵr eich bod eisiau allgofnodi?");
      expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it('should store the previous page in the session from the referer header', async () => {
        const referer = 'http://example.com'
        const response = await request(app)
          .get(SIGNOUT_LOCATION)
          .set('Referer', 'http://example.com');
    
        expect(response.status).toBe(200);
        expect(session.getExtraData(SIGNOUT_RETURN_URL_SESSION_KEY)).toBe(referer+"?lang=en");
    });

    it('should populate the back link url from the referer header', async () => {
        const referer = 'http://example.com'
        const response = await request(app)
          .get(SIGNOUT_LOCATION)
          .set('Referer', referer);

        expect(response.status).toBe(200);
        expect(response.text).toContain(`href="${referer}?lang=en"`);
    });

    it("should not store referer if it includes signout", async () => {
      const referer = 'http://example.com/signout';
      session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, "http://otherexample.com/someotherUrl?lang=en");
      const response = await request(app)
        .get(SIGNOUT_LOCATION)
        .set('Referer', referer);

      expect(response.status).toBe(200);
      expect(session.getExtraData(SIGNOUT_RETURN_URL_SESSION_KEY)).toBe("http://otherexample.com/someotherUrl?lang=en");
    });

    it("should update lang of originalUrl if it includes signout", async () => {
      const referer = 'http://example.com/signout';
      session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, "http://otherexample.com/someotherUrl?lang=en");
      const response = await request(app)
        .get(SIGNOUT_LOCATION)
        .query({lang: 'cy'})
        .set('Referer', referer);

      expect(response.status).toBe(200);
      expect(session.getExtraData(SIGNOUT_RETURN_URL_SESSION_KEY)).toBe("http://otherexample.com/someotherUrl?lang=cy");
    });
  })

  describe('post tests', () => {
    it('should show an error if no radio buttons are selected', async () => {
        const previousLocation = 'http://example.com'
        session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)
        const response = await request(app)
          .post(SIGNOUT_LOCATION)

        expect(response.status).toBe(400)
        expect(response.text).toContain('Select yes if you want to sign out');
        expect(response.text).toContain('#signout');
        expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it('should show an error if no radio buttons are selected in welsh', async () => {
      const response = await request(app)
        .post(SIGNOUT_LOCATION+"?lang=cy")

      expect(response.status).toBe(400)
      expect(response.text).toContain("Dewiswch ydw os ydych am allgofnodi");
      expect(mocks.mockCompanyAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it('should show the error page if there is no return page in session', async () => {
        const previousLocation = undefined
        session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)

        const response = await request(app)
          .post(SIGNOUT_LOCATION)

        expect(response.status).toBe(500)
    });


    it('should return the user to their previous location if they select "no"', async () => {
        const previousLocation = 'http://example.com'
        session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)

        const response = await request(app)
          .post(SIGNOUT_LOCATION)
          .send({signout: 'no'})

          expect(response.status).toBe(302)
          expect(response.get('Location')).toBe(previousLocation)
    });

    it('should return the user to their previous location in welsh if they select "no"', async () => {
      const previousLocation = 'http://example.com'
      session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)
      const response = await request(app)
        .post(SIGNOUT_LOCATION + "?lang=cy")
        .send({signout: 'no'})

      expect(response.status).toBe(302)
      expect(response.get('Location')).toBe(previousLocation)
    });

    it('should direct to account signout if they select "yes"', async () => {
      const previousLocation = 'http://example.com'
      session.setExtraData(SIGNOUT_RETURN_URL_SESSION_KEY, previousLocation)
        const response = await request(app)
          .post(SIGNOUT_LOCATION)
          .send({signout: 'yes'})

          expect(response.status).toBe(302)
          expect(response.get('Location')).toBe(ACCOUNTS_SIGNOUT_PATH+"?lang=en")
    });

  })

  describe('no session tests', () => {
    it('should show the error page when peforming post', async () => {
        // Don't populate session
        mocks.mockSessionMiddleware.mockImplementation((req, res, next) => next());

        const response = await request(app)
          .post(SIGNOUT_LOCATION)

        expect(response.status).toBe(500)
    });
  });
});