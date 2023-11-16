
import { NextFunction, Request, Response } from "express";
import { NationalityValidationType, ValidationError } from "../model/validation.model";
import { NATIONALITY_LIST } from "../utils/properties";
import { getField, setBackLink } from "../utils/web";
import { DirectorField } from "../model/director.model";
import { NationalityValidation } from "./nationality.validation.config";
import { formatValidationErrors } from "./validation";
import { Templates } from "../types/template.paths";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { urlUtils } from "../utils/url";
import { DIRECTOR_DATE_DETAILS_PATH } from "../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling } from "../services/officer.filing.service";
const VALID_NATIONALITY_CHARACTER: RegExp = /^[a-zA-Z\s]+$/;

export const nationalityValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    const nationality1 = getField(req, DirectorField.NATIONALITY_1);
    const nationality2 = getField(req, DirectorField.NATIONALITY_2);
    const nationality3 = getField(req, DirectorField.NATIONALITY_3);

    const frontendValidationErrors = validateNationality([nationality1, nationality2, nationality3], NationalityValidation);
    if(frontendValidationErrors) {
      const formattedErrors = formatValidationErrors([frontendValidationErrors]);
      return res.render(Templates.DIRECTOR_NATIONALITY, {
        templateName: Templates.DIRECTOR_NATIONALITY,
        backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req)),
        typeahead_array: NATIONALITY_LIST + "|" + NATIONALITY_LIST + "|" + NATIONALITY_LIST,
        typeahead_value: nationality1 + "|" + nationality2 + "|" + nationality3,
        errors: formattedErrors,
        typeahead_errors: JSON.stringify(formattedErrors),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      });
    }
    return next();
  } catch(error) {
    next(error);
  }
};

export const validateNationality = (nationality: string[], nationalityValidationType: NationalityValidationType): ValidationError | undefined => {
  if(!nationality[0]) {
    return nationalityValidationType.Nationality1InvalidCharacter.Nationality;
  }
  if(nationality) {
      const invalidNationality1CharacterValidationResult = validateInvalidCharacterValuesForNationality(nationality, nationalityValidationType);
      //Invalid Characters
      if(invalidNationality1CharacterValidationResult) {
          return invalidNationality1CharacterValidationResult;
      }
      const allowListNationalityValidationResult = validateAllowedListNationality(nationality, nationalityValidationType);
      //not in nationality list
      if(allowListNationalityValidationResult) {
          return allowListNationalityValidationResult;
      }
      const duplicateNationalityValidationResult = validateDuplicateNationality(nationality, nationalityValidationType);
      //validate duplicate Nationality
      if(duplicateNationalityValidationResult) {
          return duplicateNationalityValidationResult;
      }
      const invalidNationalityLengthValidationResult = validateInvalidLengthValuesForNationality(nationality, nationalityValidationType);
      //Invalid Length
      if(invalidNationalityLengthValidationResult) {
          return invalidNationalityLengthValidationResult;
      }
      const maxLengthNationalityValidationResult = validateMaximumLengthNationality(nationality, nationalityValidationType);
      //validate maximum length multiple Nationality
      if(maxLengthNationalityValidationResult) {
          return maxLengthNationalityValidationResult;
      }
  }
  return undefined;
}

export const validateInvalidCharacterValuesForNationality = (nationality: string[], nationalityValidationType: NationalityValidationType): ValidationError | undefined => {
  if(nationality[0] && (!nationality[0].trim().length || invalidPattern(nationality[0], VALID_NATIONALITY_CHARACTER))) {
      return nationalityValidationType.Nationality1InvalidCharacter.Nationality;
  }
  if(nationality[1] && (!nationality[1].trim().length || invalidPattern(nationality[1], VALID_NATIONALITY_CHARACTER))) {
    return nationalityValidationType.Nationality2InvalidCharacter.Nationality;
  }
  if(nationality[2] && (!nationality[2].trim().length || invalidPattern(nationality[2], VALID_NATIONALITY_CHARACTER))) {
    return nationalityValidationType.Nationality3InvalidCharacter.Nationality;
  }
  return undefined;
}

export const validateInvalidLengthValuesForNationality = (nationality: string[], nationalityValidationType: NationalityValidationType): ValidationError | undefined => { 
  if(nationality[0] && (nationality[0].length > 50)) {
      return nationalityValidationType.Nationality1LengthValidator.Nationality
  }
  if(nationality[1] && (nationality[1].length > 50)) {
    return nationalityValidationType.Nationality2LengthValidator.Nationality
  }
  if(nationality[2] && (nationality[2].length > 50)) {
    return nationalityValidationType.Nationality3LengthValidator.Nationality
  } 
  return undefined;
}

export const validateAllowedListNationality = (nationality: string[], nationalityValidationType: NationalityValidationType): ValidationError | undefined => {
  const nationalityList = NATIONALITY_LIST.split(";");
  if(nationality[0] && !nationalityList.includes(nationality[0])) {
    return nationalityValidationType.Nationality1AllowedList.Nationality
  }  
  if(nationality[1] && !nationalityList.includes(nationality[1])) {
    return nationalityValidationType.Nationality2AllowedList.Nationality
  }
  if(nationality[2] && !nationalityList.includes(nationality[2])) {
  return nationalityValidationType.Nationality3AllowedList.Nationality
  } 
return undefined;
} 

export const validateDuplicateNationality = (nationality: string[], nationaliltyValidationType: NationalityValidationType) => {
  if((nationality[0] && nationality[1]) && (nationality[1] ===  nationality[0])) {
    return nationaliltyValidationType.DuplicatedNationality2Validator.Nationality
  }
  if((nationality[0] && nationality[1] && nationality[2]) && (nationality[2] ===  nationality[0] || nationality[2] === nationality[1])) {
    return nationaliltyValidationType.DuplicatedNationality3Validator.Nationality
  }
}

export const validateMaximumLengthNationality = (nationality: string[], nationaliltyValidationType: NationalityValidationType) => {
  if ((nationality) && (`${nationality[0]},${nationality[1]},${nationality[2]}`.length > 48)) {
    return nationaliltyValidationType.MultipleNationalitymaxLengthValidator.Nationality
  }  
}

const invalidPattern = (input: string, regex: RegExp): boolean => {
  const matchResult = input.match(regex);
  if (matchResult == null && matchResult == undefined){
    return true
  }
  return false;
}