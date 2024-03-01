
import { NextFunction, Request, Response } from "express";
import { GenericValidationType, ValidationError } from "../model/validation.model";
import { NATIONALITY_LIST } from "../utils/properties";
import { getField, setBackLink } from "../utils/web";
import { DirectorField } from "../model/director.model";
import { NationalityValidation } from "./nationality.validation.config";
import { REGEX_FOR_VALID_CHARACTERS, formatValidationErrors } from "./validation";
import { Templates } from "../types/template.paths";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../utils/format";
import { urlUtils } from "../utils/url";
import { DIRECTOR_DATE_DETAILS_PATH, DIRECTOR_NATIONALITY_PATH, UPDATE_DIRECTOR_NATIONALITY_PATH } from "../types/page.urls";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling } from "../services/officer.filing.service";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";


export const nationalityValidator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);

    const nationality1 = getField(req, DirectorField.NATIONALITY_1);
    const nationality2 = getField(req, DirectorField.NATIONALITY_2);
    const nationality3 = getField(req, DirectorField.NATIONALITY_3);
    const isUpdate = req.path.includes("update-director-name");
    let currentUrl: string;
    if (isUpdate) {
      currentUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_NATIONALITY_PATH, req)
    } else {
      currentUrl = urlUtils.getUrlToPath(DIRECTOR_NATIONALITY_PATH, req)
    }

    const frontendValidationErrors = validateNationality([nationality1, nationality2, nationality3], NationalityValidation);
    if(frontendValidationErrors?.length) {
      const formattedErrors = formatValidationErrors(frontendValidationErrors, lang);
      return res.render(Templates.DIRECTOR_NATIONALITY, {
        templateName: Templates.DIRECTOR_NATIONALITY,
        backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(DIRECTOR_DATE_DETAILS_PATH, req)),
        typeahead_array: NATIONALITY_LIST + "|" + NATIONALITY_LIST + "|" + NATIONALITY_LIST,
        typeahead_value: nationality1 + "|" + nationality2 + "|" + nationality3,
        errors: formattedErrors,
        typeahead_errors: JSON.stringify(formattedErrors),
        directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
        nationality2_hidden: getField(req, DirectorField.NATIONALITY_2_RADIO),
        nationality3_hidden: getField(req, DirectorField.NATIONALITY_3_RADIO),
        ...getLocaleInfo(locales, lang),
        currentUrl: currentUrl
      });
    }
    return next();
  } catch(error) {
    next(error);
  }
};

export const validateNationality = (nationality: string[], nationalityValidationType: GenericValidationType): ValidationError[] | undefined => {
  const validationError: ValidationError[] = []
  if(nationality) {
    validateNationality1(nationality, nationalityValidationType, validationError);
  } 
  if(nationality) {
    validateNationality2(nationality, nationalityValidationType, validationError);
  }
  if(nationality) {
    validateNationality3(nationality, nationalityValidationType, validationError);
  }
  return validationError;
}

export const validateNationality1 = (nationality: string[], nationalityValidationType: GenericValidationType, validationError: ValidationError[]) => {
  const nationalityList = NATIONALITY_LIST.split(";");
  if (nationality[0]) {
    validateCommonNationality(nationality, validationError, nationalityValidationType, nationalityList);  
  } else {
    //blank field
    validationError.push(nationalityValidationType.Nationality1Blank.ErrorField)
  }
}

export const validateNationality2 = (nationality: string[], nationalityValidationType: GenericValidationType, validationError: ValidationError[]) => {
  const nationalityList = NATIONALITY_LIST.split(";");
  if (nationality[1]) {
    if (validationError.every(error => error.link !== DirectorField.NATIONALITY_2)) {
      if (!nationality[1].trim().length || !nationality[1].match(REGEX_FOR_VALID_CHARACTERS)) {
        validationError.push(nationalityValidationType.Nationality2InvalidCharacter.ErrorField);
      } else if ((nationality[1].length > 50)) {
          validationError.push(nationalityValidationType.Nationality2LengthValidator.ErrorField);
      }  else if (nationality[1] && nationality[2] && (`${nationality[1]},${nationality[2]}`.length > 49)) {
          //dual max length 49
          validationError.push(
            nationalityValidationType.DualNationality2LengthValidator.ErrorField,
            nationalityValidationType.DualNationality3LengthValidator.ErrorField);
      } else if (nationality[1] == nationality[2]) {
          //duplicated
          validationError.push(
            nationalityValidationType.DuplicatedNationality2Validator.ErrorField,
            nationalityValidationType.DuplicatedNationality3Validator.ErrorField
        )            
      } else if (!nationalityList.includes(nationality[1])) {
          validationError.push(nationalityValidationType.Nationality2AllowedList.ErrorField);
      } 
    }
  }
}

export const validateNationality3 = (nationality: string[], nationalityValidationType: GenericValidationType, validationError: ValidationError[]) => {
  const nationalityList = NATIONALITY_LIST.split(";");
  if (nationality[2]) {
    if (validationError.every(error => error.link !== DirectorField.NATIONALITY_3)) {
      if (!nationality[2].trim().length || !nationality[2].match(REGEX_FOR_VALID_CHARACTERS)) {
        validationError.push(nationalityValidationType.Nationality3InvalidCharacter.ErrorField);
      } else if ((nationality[2].length > 50)) {
            validationError.push(nationalityValidationType.Nationality3LengthValidator.ErrorField);  
      } 
      else if (!nationalityList.includes(nationality[2])) {
        validationError.push(nationalityValidationType.Nationality3AllowedList.ErrorField);
      } 
   }
  }
}

const validateCommonNationality = (
      nationality: string[], 
      validationError: ValidationError[], 
      nationalityValidationType: GenericValidationType, 
      nationalityList: string[]) => {
  if (!nationality[0].trim().length || !nationality[0].match(REGEX_FOR_VALID_CHARACTERS)) {
    //character
    validationError.push(nationalityValidationType.Nationality1InvalidCharacter.ErrorField);
  } else if ((nationality[0].length > 50)) {
    //length
    validationError.push(nationalityValidationType.Nationality1LengthValidator.ErrorField);
  } else if (nationality[0] && nationality[1] && nationality[2] && (`${nationality[0]},${nationality[1]},${nationality[2]}`.length > 48)) {
    //all max length 48
    validationError.push(
      nationalityValidationType.MultipleNationality1maxLength48Validator.ErrorField,
      nationalityValidationType.MultipleNationality2maxLength48Validator.ErrorField,
      nationalityValidationType.MultipleNationality3maxLength48Validator.ErrorField);
  } else if (nationality[0] && nationality[1] && (`${nationality[0]},${nationality[1]}`.length > 49)) {
    //dual max length 49
    validationError.push(
      nationalityValidationType.DualNationality1LengthValidator.ErrorField,
      nationalityValidationType.DualNationality2LengthValidator.ErrorField);
  } else if (nationality[0] && nationality[2] && (`${nationality[0]},${nationality[2]}`.length > 49)) {
    //dual max length 49
    validationError.push(
      nationalityValidationType.DualNationality1LengthValidator.ErrorField,
      nationalityValidationType.DualNationality3LengthValidator.ErrorField);
  } else if (nationality[0] == nationality[1]) {
    //duplicated
    validationError.push(nationalityValidationType.DuplicatedNationality2Validator.ErrorField);
  } else if (nationality[0] == nationality[2]) {
    //duplicated
    validationError.push(nationalityValidationType.DuplicatedNationality3Validator.ErrorField);
  } else if (!nationalityList.includes(nationality[0])) {
    //list validation
    validationError.push(nationalityValidationType.Nationality1AllowedList.ErrorField);
  }
}
