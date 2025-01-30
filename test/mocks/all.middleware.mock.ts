import mockServiceAvailabilityMiddleware from "./service.availability.middleware.mock";
import mockAuthenticationMiddleware from "./authentication.middleware.mock";
import { mockCreateSessionMiddleware, mockSessionStore, setShouldThrowError } from "./session.middleware.mock";
import { mockCreateCsrfProtectionMiddleware, mockCsrfErrorHandler } from "./csrf.middleware.mock";
import mockCompanyAuthenticationMiddleware from "./company.authentication.middleware.mock";

export default {
  mockServiceAvailabilityMiddleware,
  mockAuthenticationMiddleware,
  mockCreateSessionMiddleware,
  setShouldThrowError,
  mockCreateCsrfProtectionMiddleware,
  mockCompanyAuthenticationMiddleware,
  mockCsrfErrorHandler,
};
