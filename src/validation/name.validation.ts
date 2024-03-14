import { NextFunction, Request, Response } from "express";
import { GenericValidationType, ValidationError } from "../model/validation.model";
import { getField, setBackLink } from "../utils/web";
import { TITLE_LIST } from "../utils/properties";
import { DirectorField } from "../model/director.model";
import { NameValidation } from "./name.validation.config";
import { REGEX_FOR_VALID_FORMER_NAMES, REGEX_FOR_VALID_NAME, formatValidationErrors } from "./validation";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { CURRENT_DIRECTORS_PATH, DIRECTOR_NAME_PATH, UPDATE_DIRECTOR_NAME_PATH, UPDATE_DIRECTOR_DETAILS_PATH } from "../types/page.urls";
import { getOfficerFiling } from "../services/officer.filing.service";
import { getLocaleInfo, getLocalesService, selectLang } from "../utils/localise";

const NAME_FIELD_LENGTH_50 = 50;
const NAME_FIELD_LENGTH_160 = 160;

export const nameValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
        const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
        const session: Session = req.session as Session;
        const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    
        const title = getField(req, DirectorField.TITLE);
        const firstName = getField(req, DirectorField.FIRST_NAME);
        const middleNames = getField(req, DirectorField.MIDDLE_NAMES);
        const lastName = getField(req, DirectorField.LAST_NAME);
        const previousNamesRadio = getField(req, DirectorField.PREVIOUS_NAMES_RADIO);
        const formerNames = getField(req, DirectorField.PREVIOUS_NAMES);
        const isUpdate = req.path.includes("update-director-name");
        const frontendValidationErrors = validateName(req, NameValidation, isUpdate);
        let currentUrl;
        let backLinkUrl: string;
        if(isUpdate){
          currentUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_NAME_PATH, req)
          backLinkUrl = urlUtils.getUrlToPath(UPDATE_DIRECTOR_DETAILS_PATH, req)
        }
        else{
          currentUrl = urlUtils.getUrlToPath(DIRECTOR_NAME_PATH, req)
          backLinkUrl = urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req)
        }

        if(frontendValidationErrors.length > 0) {
            const formattedErrors = formatValidationErrors(frontendValidationErrors, lang);

            return res.render(Templates.DIRECTOR_NAME, {
                ...getLocaleInfo(locales, lang),
                currentUrl: currentUrl,
                templateName: Templates.DIRECTOR_NAME,
                backLinkUrl: setBackLink(req, officerFiling?.checkYourAnswersLink, backLinkUrl),
                typeahead_array: TITLE_LIST,
                errors: formattedErrors,
                typeahead_errors: JSON.stringify(formattedErrors),
                typeahead_value: title,
                first_name: firstName,
                middle_names: middleNames,
                last_name: lastName,
                previous_names: formerNames,
                previous_names_radio: previousNamesRadio,
                isUpdate
            });
          }
        return next();

    } catch(error) {
        next(error);
    }
};

export const validateName = (req: Request, nameValidationType: GenericValidationType, isUpdate: boolean): ValidationError[] => {
    const title = getField(req, DirectorField.TITLE);
    const firstName = getField(req, DirectorField.FIRST_NAME);
    const middleNames = getField(req, DirectorField.MIDDLE_NAMES);
    const lastName = getField(req, DirectorField.LAST_NAME);
    const previousNamesRadio = getField(req, DirectorField.PREVIOUS_NAMES_RADIO);
    const formerNames = getField(req, DirectorField.PREVIOUS_NAMES);
    let validationErrors: ValidationError[] = [];

    validateTitle(title, nameValidationType, validationErrors);
    validateFirstName(firstName, nameValidationType, validationErrors);
    validateMiddleNames(middleNames, nameValidationType, validationErrors);
    validateLastName(lastName, nameValidationType, validationErrors);
    if(!isUpdate) {
        validateFormerNames(formerNames, previousNamesRadio, nameValidationType, validationErrors);
    }

    return validationErrors;
};

const validateTitle = (title: string, nameValidationType: GenericValidationType, validationErrors: ValidationError[]) => {
    if(title != null && title != "") {
        if (!title.match(REGEX_FOR_VALID_NAME)){
            // invalid characters
            validationErrors.push(nameValidationType.TitleInvalidCharacter.ErrorField);
        } else if (title.length > NAME_FIELD_LENGTH_50){
            // character count limit
            validationErrors.push(nameValidationType.TitleLength.ErrorField);
        }
    }
}

const validateFirstName = (firstName: string, nameValidationType: GenericValidationType, validationErrors: ValidationError[]) => {
    if(firstName != null && firstName != "") {
        if (!firstName.match(REGEX_FOR_VALID_NAME)){
            // invalid characters
            validationErrors.push(nameValidationType.FirstNameInvalidCharacter.ErrorField);
        } else if (firstName.length > NAME_FIELD_LENGTH_50){
            // character count limit
            validationErrors.push(nameValidationType.FirstNameLength.ErrorField);
        }
    } else {
        // blank field
        validationErrors.push(nameValidationType.FirstNameBlank.ErrorField);
    }
}

const validateMiddleNames = (middleNames: string, nameValidationType: GenericValidationType, validationErrors: ValidationError[]) => {
    if(middleNames != null && middleNames != "") {
        if (!middleNames.match(REGEX_FOR_VALID_NAME)){
            // invalid characters
            validationErrors.push(nameValidationType.MiddleNamesInvalidCharacter.ErrorField);
        } else if (middleNames.length > NAME_FIELD_LENGTH_50){
            // character count limit
            validationErrors.push(nameValidationType.MiddleNamesLength.ErrorField);
        }
    }
}

const validateLastName = (lastName: string, nameValidationType: GenericValidationType, validationErrors: ValidationError[]) => {
    if(lastName != null && lastName != "") {
        if (!lastName.match(REGEX_FOR_VALID_NAME)){
            // invalid characters
            validationErrors.push(nameValidationType.LastNameInvalidCharacter.ErrorField);
        } else if (lastName.length > NAME_FIELD_LENGTH_160){
            // character count limit
            validationErrors.push(nameValidationType.LastNameLength.ErrorField);
        }
    } else {
        validationErrors.push(nameValidationType.LastNameBlank.ErrorField);
    }
}

const validateFormerNames = (formerNames: string, previousNamesRadio: string, nameValidationType: GenericValidationType, validationErrors: ValidationError[]) => {
    if (!previousNamesRadio) {
        validationErrors.push(nameValidationType.PreviousNamesRadioUnselected.ErrorField);
    }
    else if (previousNamesRadio == DirectorField.YES) {
        if(formerNames != null && formerNames != "") {
            if (!formerNames.match(REGEX_FOR_VALID_FORMER_NAMES)){
                // invalid characters
                validationErrors.push(nameValidationType.PreviousNamesInvalidCharacter.ErrorField);
            } else if (formerNames.length > NAME_FIELD_LENGTH_160){
                // character count limit
                validationErrors.push(nameValidationType.PreviousNamesLength.ErrorField);
            }
        } else {
            validationErrors.push(nameValidationType.PreviousNamesMissing.ErrorField);
        }
    }
}