import { Request } from 'express';
import { ValidationError } from '../model/validation.model';
import { protectedDetailsErrorMessageKey } from '../utils/api.enumerations.keys';
import { createValidationErrorBasic } from '../validation/validation';

const protectedDetailsHtmlField: string = "protected_details";

export const buildValidationErrors = (req: Request): ValidationError[] => {
    const validationErrors: ValidationError[] = [];
    if (!req.body[protectedDetailsHtmlField]) {
        validationErrors.push(createValidationErrorBasic(protectedDetailsErrorMessageKey.NO_PROTECTED_DETAILS_RADIO_BUTTON_SELECTED, protectedDetailsHtmlField));
    }
    return validationErrors;
};
