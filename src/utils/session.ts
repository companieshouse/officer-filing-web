import { SessionKey } from '@companieshouse/node-session-handler/lib/session/keys/SessionKey';
import { SignInInfoKeys } from '@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys';
import { ISignInInfo } from '@companieshouse/node-session-handler/lib/session/model/SessionInterfaces';
import { AccessTokenKeys } from '@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys';

export function getSignInInfo(session): ISignInInfo {
  return session?.data?.[SessionKey.SignInInfo];
}

export function getAccessToken(session): string {
  const signInInfo = getSignInInfo(session);
  return signInInfo?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken] as string;
}
