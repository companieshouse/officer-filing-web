import mocks from '../mocks/all.middleware.mock';

import request from "supertest";
import app from "../../src/app";
import { ACCOUNTS_SIGNOUT_PATH, OFFICER_FILING, SIGNOUT_PATH } from "../../src/types/page.urls";

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
  })

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

    it('should return the user to their previous location if they select "no"', async () => {

    });

    it('should return the user to their previous location in welsh if they select "no"', async () => {

    });

    it('should direct to account signout if they select "yes"', async () => {
      const response = await request(app)
        .post(SIGNOUT_LOCATION)
        .send({ signout: 'yes' })

      expect(response.status).toBe(302)
      expect(response.get('Location')).toBe(ACCOUNTS_SIGNOUT_PATH + "?lang=en")
    });
  });
});