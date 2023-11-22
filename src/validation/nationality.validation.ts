
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
const VALID_NATIONALITY_CHARACTER: RegExp = /^[a-zA-Z]+(?: [a-zA-Z]+|-?[a-zA-Z]+(?:-[a-zA-Z]+)?(?: [a-zA-Z]+)?)*$/;

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
    if(frontendValidationErrors?.length) {
      const formattedErrors = formatValidationErrors(frontendValidationErrors);
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

export const validateNationality = (nationality: string[], nationalityValidationType: NationalityValidationType): ValidationError[] | undefined => {
  const validationError: ValidationError[] = []
  if(!nationality[0]) {
    return [nationalityValidationType.Nationality1InvalidCharacter.Nationality];
  }
  if(nationality) {
      validateInvalidCharacterValuesForNationality(nationality, nationalityValidationType, validationError);
      validateAllowedListNationality(nationality, nationalityValidationType, validationError);
      validateDuplicateNationality(nationality, nationalityValidationType, validationError);
      validateInvalidLengthValuesForNationality(nationality, nationalityValidationType, validationError);
  }
  return validationError;
}

export const validateInvalidCharacterValuesForNationality = (nationality: string[], nationalityValidationType: NationalityValidationType, validationError: ValidationError[]) => {
  
  if(nationality[0] && (!nationality[0].trim().length || invalidPattern(nationality[0], VALID_NATIONALITY_CHARACTER))) {
    validationError.push(nationalityValidationType.Nationality1InvalidCharacter.Nationality);
  }
  if(nationality[1] && (!nationality[1].trim().length  || invalidPattern(nationality[1], VALID_NATIONALITY_CHARACTER))) {
    validationError.push(nationalityValidationType.Nationality2InvalidCharacter.Nationality);
  }
  if(nationality[2] && (!nationality[2].trim().length || invalidPattern(nationality[2], VALID_NATIONALITY_CHARACTER))) {
    validationError.push(nationalityValidationType.Nationality3InvalidCharacter.Nationality);
  }
}

export const validateInvalidLengthValuesForNationality = (nationality: string[], nationalityValidationType: NationalityValidationType, validationError: ValidationError[]) => { 
  if(nationality[0] && (nationality[0].length > 50)) {
    validationError.push(nationalityValidationType.Nationality1LengthValidator.Nationality);
  }
  if(nationality[1] && (nationality[1].length > 50)) {
    validationError.push(nationalityValidationType.Nationality2LengthValidator.Nationality);
  }
  if(nationality[2] && (nationality[2].length > 50)) {
    validationError.push(nationalityValidationType.Nationality3LengthValidator.Nationality);
  } 
  validateInvalidDualNationalityMaxLength49(nationality, nationalityValidationType, validationError);
  validateInvalidMaxMultipleNationalityLength48(nationality, nationalityValidationType, validationError);
  validateMultipleNationalityLength50(nationality, nationalityValidationType, validationError); 
}

export const validateAllowedListNationality = (nationality: string[], nationalityValidationType: NationalityValidationType, validationError: ValidationError[]) => {
  const nationalityList = NATIONALITY_LIST.split(";");
  if(nationality[0] && !nationalityList.includes(nationality[0])) {
    validationError.push(nationalityValidationType.Nationality1AllowedList.Nationality);
  }  
  if(nationality[1] && !nationalityList.includes(nationality[1])) {
    validationError.push(nationalityValidationType.Nationality2AllowedList.Nationality);

  }
  if(nationality[2] && !nationalityList.includes(nationality[2])) {
    validationError.push(nationalityValidationType.Nationality3AllowedList.Nationality);
  } 
} 

export const validateDuplicateNationality = (nationality: string[], nationaliltyValidationType: NationalityValidationType, validationError: ValidationError[]) => {
  if((nationality[0] && nationality[1]) && (nationality[1] ===  nationality[0])) {
    validationError.push(nationaliltyValidationType.DuplicatedNationality2Validator.Nationality);};
  if((nationality[0] && nationality[2]) && (nationality[2] ===  nationality[0])) {
    validationError.push(nationaliltyValidationType.DuplicatedNationality3Validator.Nationality);}
  if((nationality[1] && nationality[2]) && (nationality[2] === nationality[1])) {
    validationError.push(
      nationaliltyValidationType.DuplicatedNationality2Validator.Nationality,
      nationaliltyValidationType.DuplicatedNationality3Validator.Nationality);
  }
}

export const validateInvalidMaxMultipleNationalityLength48 = (nationality: string[], nationalityValidationType: NationalityValidationType,  validationError: ValidationError[]) => {
  if ((nationality) && nationality[0] && nationality[1] && nationality[2] && (`${nationality[0]},${nationality[1]},${nationality[2]}`.length > 48)) {
    validationError.push(
                        nationalityValidationType.MultipleNationality1maxLength48Validator.Nationality,
                        nationalityValidationType.MultipleNationality2maxLength48Validator.Nationality,
                        nationalityValidationType.MultipleNationality3maxLength48Validator.Nationality);
  }
};

export const validateInvalidDualNationalityMaxLength49 = (nationality: string[], nationaliltyValidationType: NationalityValidationType,  validationError: ValidationError[]) => {
  if ((nationality) && nationality[0] && nationality[1] && (`${nationality[0]},${nationality[1]}`.length > 49)) {
    validationError.push(
      nationaliltyValidationType.DualNationality1LengthValidator.Nationality,
      nationaliltyValidationType.DualNationality2LengthValidator.Nationality);
  }  
  if ((nationality) && nationality[0] && nationality[2] && (`${nationality[0]},${nationality[2]}`.length > 49)) {
    validationError.push(
      nationaliltyValidationType.DualNationality1LengthValidator.Nationality,
      nationaliltyValidationType.DualNationality3LengthValidator.Nationality);
      } 
  if ((nationality)&& nationality[1] && nationality[2] && (`${nationality[1]},${nationality[2]}`.length > 49)) {
    validationError.push(
      nationaliltyValidationType.DualNationality2LengthValidator.Nationality,
      nationaliltyValidationType.DualNationality3LengthValidator.Nationality);
  } 
}


const validateMultipleNationalityLength50 = (nationality: string[], nationalityValidationType: NationalityValidationType,  validationError: ValidationError[]) => {
  if ((nationality) && nationality[0] && nationality[1] && nationality[2] && (`${nationality[1]},${nationality[1]},${nationality[2]}`.length > 50)) {
    validationError.push(
      nationalityValidationType.MultipleNationality1maxLength50Validator.Nationality,
      nationalityValidationType.MultipleNationality2maxLength50Validator.Nationality,
      nationalityValidationType.MultipleNationality3maxLength50Validator.Nationality,
      );
  }
}

const invalidPattern = (input: string, regex: RegExp): boolean => {
  const matchResult = input.match(regex);
  if (matchResult == null || matchResult == undefined){
    return true
  }
  return false;
}