import PrivateApiClient from 'private-api-sdk-node/dist/client';
import { createPrivateOAuthApiClient } from '../../src/services/api.service';
import { getSessionRequest } from '../mocks/session.mock';

describe('ApiService Test suite', () => {

    it('check instance of PrivateApiClient', () => {
      const client = createPrivateOAuthApiClient(getSessionRequest());
      expect(client).toBeInstanceOf(PrivateApiClient);
    });
  
});