jest.mock('../../src/validation/validation');

import { Request } from 'express';
import { buildValidationErrors } from '../../src/validation/protected.details.validation';
import { ValidationError } from '../../src/model/validation.model';
import { protectedDetailsErrorMessageKey } from '../../src/utils/api.enumerations.keys';
import { createValidationErrorBasic } from '../../src/validation/validation';

const mockCreateValidationErrorBasic = createValidationErrorBasic as jest.Mock;

describe('buildValidationErrors', () => {
  it('should return an empty array if no validation errors are found', () => {
    const req: Request = {
      body: {
        protected_details: true,
      }
    } as Request;

    const validationErrors: ValidationError[] = buildValidationErrors(req);

    expect(validationErrors).toEqual([]);
  });

  it('should return a validation error if no protected details radio button is selected', () => {
    const req: Request = {
      body: {
        protected_details: undefined,
      }
    } as Request;

    mockCreateValidationErrorBasic.mockReturnValueOnce({
      errorMessageKey: protectedDetailsErrorMessageKey.NO_PROTECTED_DETAILS_RADIO_BUTTON_SELECTED,
      field: 'protected_details'
    });

    const validationErrors: ValidationError[] = buildValidationErrors(req);

    expect(validationErrors).toHaveLength(1);
    expect(validationErrors).toEqual([
      {
        errorMessageKey: protectedDetailsErrorMessageKey.NO_PROTECTED_DETAILS_RADIO_BUTTON_SELECTED,
        field: 'protected_details'
      }
    ]);
  });
});