import mocks from '../mocks/all.middleware.mock';

import request from "supertest";
import app from "../../src/app";
import {ACCOUNTS_SIGNOUT_PATH, OFFICER_FILING, SIGNOUT_PATH } from "../../src/types/page.urls";
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
          .get(SIGNOUT_LOCATION);

        expect(response.status).toBe(200);
        expect(response.text).toContain('Are you sure you want to sign out?');
    });

    it('should store the previous page in the session from the referer header', async () => {
        const referer = 'return url'
        const response = await request(app)
          .get(SIGNOUT_LOCATION)
          .set('Referer', 'return url');
    
        expect(response.status).toBe(200);
        expect(session.getExtraData(SIGNOUT_RETURN_URL_SESSION_KEY)).toBe(referer);
    });

    it('should populate the back link url from the referer header', async () => {
        const referer = 'return url'
        const response = await request(app)
          .get(SIGNOUT_LOCATION)
          .set('Referer', referer);

        expect(response.status).toBe(200);
        expect(response.text).toContain(`href="${referer}"`)
    });
  })

  describe('post tests', () => {
    it('should show an error if no radio buttons are selected', async () => {
        const response = await request(app)
          .post(SIGNOUT_LOCATION)

        expect(response.status).toBe(400)
        expect(response.text).toContain('Select yes if you want to sign out')
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

    it('should direct to account signout if they select "yes"', async () => {
        const response = await request(app)
          .post(SIGNOUT_LOCATION)
          .send({signout: 'yes'})
        
          expect(response.status).toBe(302)
          expect(response.get('Location')).toBe(ACCOUNTS_SIGNOUT_PATH)
    });
  })

  describe('no session tests', () => {
    it('should not populate session when getting', async () => {
        // Don't populate session
        mocks.mockSessionMiddleware.mockImplementation((req, res, next) => next());

        const response = await request(app)
          .get(SIGNOUT_LOCATION)

        expect(response.status).toBe(200)
    });

    it('should show the error page when peforming post', async () => {
        // Don't populate session
        mocks.mockSessionMiddleware.mockImplementation((req, res, next) => next());

        const response = await request(app)
          .post(SIGNOUT_LOCATION)

        expect(response.status).toBe(500)
    });
  })
});