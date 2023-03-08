import mockServiceAvailabilityMiddleware from "./service.availability.middleware.mock";
import mockAuthenticationMiddleware from "./authentication.middleware.mock";
import mockSessionMiddleware from "./session.middleware.mock";
import mockCompanyAuthenticationMiddleware from "./company.authentication.middleware.mock";
import mockSubmissionIdValidationMiddleware from "./submission.id.validation.middleware.mock";
import mockTransactionIdValidationMiddleware from "./transaction.id.validation.middleware.mock";
import mockIsPscQueryParameterValidationMiddleware from "./is.psc.validation.middleware.mock";
import mockCompanyNumberQueryParameterValidationMiddleware from "./company.number.validation.middleware.mock";

export default {
  mockServiceAvailabilityMiddleware,
  mockAuthenticationMiddleware,
  mockSessionMiddleware,
  mockCompanyAuthenticationMiddleware,
  mockSubmissionIdValidationMiddleware,
  mockTransactionIdValidationMiddleware,
  mockIsPscQueryParameterValidationMiddleware,
  mockCompanyNumberQueryParameterValidationMiddleware
};
