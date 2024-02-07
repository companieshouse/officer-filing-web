import { ValidationStatusResponse, ValidationStatusError } from "@companieshouse/api-sdk-node/dist/services/officer-filing";


export const createMockValidationStatusError = (errorMessage: string) : ValidationStatusError => {
    return {
        error: errorMessage,
        location: "$./transactions/185318-541416-850071/officers/646f2b75f8b00c631d83feb2/validation_status",
        type: "ch:validation",
        locationType: "json-path"
    };
}

export const mockValidationStatusError: ValidationStatusError = createMockValidationStatusError("European public limited liability company (SE) not permitted");
export const mockValidationStatusError1: ValidationStatusError = createMockValidationStatusError("Date John Doe was removed is missing");
export const mockValidationStatusError2: ValidationStatusError = createMockValidationStatusError("Date John Doe was removed must be a real date");
export const mockValidationStatusError3: ValidationStatusError = createMockValidationStatusError("Date John Doe was removed must be today or in the past");
export const mockValidationStatusError4: ValidationStatusError = createMockValidationStatusError("The date you enter must be after the company's incorporation date");
export const mockValidationStatusError5: ValidationStatusError = createMockValidationStatusError("Date John Doe was removed must be on or after the date the director was appointed");
export const mockValidationStatusError6: ValidationStatusError = createMockValidationStatusError("You cannot add, remove or update a director from a company that has been dissolved or is in the process of being dissolved");
export const mockValidationStatusErrorPreOct2009: ValidationStatusError = createMockValidationStatusError("Enter a date that is on or after 1 October 2009. If the director was removed before this date, you must file form 288b instead");
export const mockValidationStatusErrorEtag: ValidationStatusError = createMockValidationStatusError("The Director’s information was updated before you sent this submission. You will need to start again");
export const mockValidationStatusErrorFirstName: ValidationStatusError = createMockValidationStatusError("First name must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
export const mockValidationStatusErrorTitle: ValidationStatusError = createMockValidationStatusError("Title must be 50 characters or less");
export const mockValidationStatusErrorLastName: ValidationStatusError = createMockValidationStatusError("Enter the director’s last name");
export const mockValidationStatusErrorFormerNames: ValidationStatusError = createMockValidationStatusError("Previous names must only include letters a to z, and common special characters such as hyphens, spaces and apostrophes");
export const mockValidationStatusErrorOccupation: ValidationStatusError = createMockValidationStatusError("Occupation must be 100 characters or less");
export const mockValidationStatusErrorNationalityInvalid: ValidationStatusError = createMockValidationStatusError("Select a nationality from the list");
export const mockValidationStatusErrorNationalityLength: ValidationStatusError = createMockValidationStatusError("For technical reasons, we are currently unable to accept multiple nationalities with a total of more than 48 characters");
export const mockValidationStatusErrorDob: ValidationStatusError = createMockValidationStatusError("You can only appoint a person as a director if they are at least 16 years old");
export const mockValidationStatusErrorUnderageAppointment: ValidationStatusError = createMockValidationStatusError("You can only appoint a person as director if they are at least 16 years old on their appointment date");
export const mockValidationStatusErrorAppointmentDate: ValidationStatusError = createMockValidationStatusError("Date the director was appointed must be on or after the incorporation date");

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
