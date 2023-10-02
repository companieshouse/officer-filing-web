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

export const mockValidationStatusErrorEtag: ValidationStatusError = {
    error: "The Director’s information was updated before you sent this submission. You will need to start again",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorFirstName: ValidationStatusError = {
    error: "First name must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorTitle: ValidationStatusError = {
    error: "Title must be 50 characters or less",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorLastName: ValidationStatusError = {
    error: "Enter the director’s last name",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorFormerNames: ValidationStatusError = {
    error: "Previous names must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
  }

export const mockValidationStatusErrorOccupation: ValidationStatusError = {
    error: "Occupation must be 100 characters or less",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorNationalityInvalid: ValidationStatusError = {
    error: "Select a nationality from the list",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorNationalityLength: ValidationStatusError = {
    error: "For technical reasons, we are currently unable to accept multiple nationalities with a total of more than 48 characters including commas",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorDob: ValidationStatusError = {
    error: "You can only appoint a person as a director if they are at least 16 years old",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorUnderageAppointment: ValidationStatusError = {
    error: "You can only appoint a person as director if they are at least 16 years old on their appointment date",
    location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
    type: "ch:validation",
    locationType: "json-path"
}

export const mockValidationStatusErrorAppointmentDate: ValidationStatusError = {
    error: "Date the director was appointed must be on or after the incorporation date",
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

export const mockValidationStatusResponseEtag: ValidationStatusResponse = {
    errors: [mockValidationStatusErrorEtag],
    isValid: false
}

export const mockValidationStatusResponseDirectorName: ValidationStatusResponse = {
    errors: [mockValidationStatusErrorFirstName, mockValidationStatusErrorLastName],
    isValid: false
}
