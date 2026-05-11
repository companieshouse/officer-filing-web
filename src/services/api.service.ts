import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { API_URL, CHS_API_KEY } from "../utils/properties";
import { createAndLogError } from "../utils/logger";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import PrivateApiClient from "private-api-sdk-node/dist/client";
import { createPrivateApiClient } from "private-api-sdk-node";
import { getAccessToken } from "../utils/session";

export const createPublicOAuthApiClient = (session: Session): ApiClient => {
    const oAuth = session.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];
    if (oAuth) {
        return createApiClient(undefined, oAuth, API_URL);
    }
    throw createAndLogError("Error getting session keys for creating public api client");
};

export const createPublicApiKeyClient = (): ApiClient => {
    return createApiClient(CHS_API_KEY, undefined, API_URL);
};

export const createPaymentApiClient = (session: Session, paymentUrl: string): ApiClient => {
    const oAuth = session.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];
    if (oAuth) {
        return createApiClient(undefined, oAuth, paymentUrl);
    }
    throw createAndLogError("Error getting session keys for creating public api client");
};

export const createPrivateOAuthApiClient = (session: Session | undefined): PrivateApiClient => {
    const oAuth: string = getAccessToken(session);
    return createPrivateApiClient(undefined, oAuth, API_URL);
};
