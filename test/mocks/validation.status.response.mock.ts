import { ValidationStatusResponse, ValidationStatusError } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const mockValidationStatusError: ValidationStatusError = {
    error: "European public limited liability company (SE) not permitted",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusError3: ValidationStatusError = {
    error: "Date John Doe was removed must be today or in the past",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusError1: ValidationStatusError = {
    error: "Date John Doe was removed is missing",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusError2: ValidationStatusError = {
    error: "Date John Doe was removed must be a real date",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusError4: ValidationStatusError = {
    error: "The date you enter must be after the company's incorporation date",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusError5: ValidationStatusError = {
    error: "Date John Doe was removed must be on or after the date the director was appointed",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusError6: ValidationStatusError = {
    error: "You cannot remove a director from a company that has been dissolved or is in the process of being dissolved",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorPreOct2009: ValidationStatusError = {
    error: "Enter a date that is on or after 1 October 2009. If the director was removed before this date, you must file form 288b instead",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidValidationStatusResponse: ValidationStatusResponse = {
    errors: [],
    isValid: true
}

export const mockValidationStatusResponse: ValidationStatusResponse = {
    errors: [mockValidationStatusError],
    isValid: false
}

export const mockValidationStatusResponseList: ValidationStatusResponse = {
    errors: [mockValidationStatusError4, mockValidationStatusError2, mockValidationStatusError3, mockValidationStatusError5, mockValidationStatusError1, mockValidationStatusError6],
    isValid: false
}

export const mockValidationStatusResponseList2: ValidationStatusResponse = {
    errors: [mockValidationStatusError4, mockValidationStatusError3, mockValidationStatusError5],
    isValid: false
}

export const mockValidationStatusResponseList3: ValidationStatusResponse = {
    errors: [mockValidationStatusError4, mockValidationStatusError5],
    isValid: false
}

export const mockValidationStatusResponseList4: ValidationStatusResponse = {
    errors: [mockValidationStatusError5],
    isValid: false
}

export const mockValidationStatusResponsePreOct2009: ValidationStatusResponse = {
    errors: [mockValidationStatusErrorPreOct2009],
    isValid: false
}
