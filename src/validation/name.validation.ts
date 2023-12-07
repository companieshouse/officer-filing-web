import { NextFunction, Request, Response } from "express";
import { NameValidationType, ValidationError } from "../model/validation.model";
import { getField, setBackLink } from "../utils/web";
import { TITLE_LIST } from "../utils/properties";
import { DirectorField } from "../model/director.model";
import { NameValidation } from "./name.validation.config";
import { REGEX_FOR_VALID_CHARACTERS, createValidationError, createValidationErrorBasic, formatValidationErrors } from "./validation";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { CURRENT_DIRECTORS_PATH } from "../types/page.urls";
import { getOfficerFiling } from "../services/officer.filing.service";
import { lookupWebValidationMessage } from "../utils/api.enumerations";
import { formerNamesErrorMessageKey } from "../utils/api.enumerations.keys";

const NAME_FIELD_LENGTH_50 = 50;
const NAME_FIELD_LENGTH_160 = 160;

export const nameValidator = async (req: Request, res: Response, next: NextFunction) => {
    try {
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
        const isUpdate = true ? req.path.includes("update-director-name") : false;
        const frontendValidationErrors = validateName(req, NameValidation, isUpdate);

        if(frontendValidationErrors.length > 0) {
            const formattedErrors = formatValidationErrors(frontendValidationErrors);

            return res.render(Templates.DIRECTOR_NAME, {
                templateName: Templates.DIRECTOR_NAME,
                backLinkUrl: setBackLink(req, officerFiling?.checkYourAnswersLink, urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req)),
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

export const validateName = (req: Request, nameValidationType: NameValidationType, isUpdate: boolean): ValidationError[] => {
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

const validateTitle = (title: string, nameValidationType: NameValidationType, validationErrors: ValidationError[]) => {
    if(title != null && title != "") {
        if (!title.match(REGEX_FOR_VALID_CHARACTERS)){
            // invalid characters
            validationErrors.push(nameValidationType.TitleInvalidCharacter.Name);
        } else if (title.length > NAME_FIELD_LENGTH_50){
            // character count limit
            validationErrors.push(nameValidationType.TitleLength.Name);
        }
    }
}

const validateFirstName = (firstName: string, nameValidationType: NameValidationType, validationErrors: ValidationError[]) => {
    if(firstName != null && firstName != "") {
        if (!firstName.match(REGEX_FOR_VALID_CHARACTERS)){
            // invalid characters
            validationErrors.push(nameValidationType.FirstNameInvalidCharacter.Name);
        } else if (firstName.length > NAME_FIELD_LENGTH_50){
            // character count limit
            validationErrors.push(nameValidationType.FirstNameLength.Name);
        }
    } else {
        // blank field
        validationErrors.push(nameValidationType.FirstNameBlank.Name);
    }
}

const validateMiddleNames = (middleNames: string, nameValidationType: NameValidationType, validationErrors: ValidationError[]) => {
    if(middleNames != null && middleNames != "") {
        if (!middleNames.match(REGEX_FOR_VALID_CHARACTERS)){
            // invalid characters
            validationErrors.push(nameValidationType.MiddleNamesInvalidCharacter.Name);
        } else if (middleNames.length > NAME_FIELD_LENGTH_50){
            // character count limit
            validationErrors.push(nameValidationType.MiddleNamesLength.Name);
        }
    }
}

const validateLastName = (lastName: string, nameValidationType: NameValidationType, validationErrors: ValidationError[]) => {
    if(lastName != null && lastName != "") {
        if (!lastName.match(REGEX_FOR_VALID_CHARACTERS)){
            // invalid characters
            validationErrors.push(nameValidationType.LastNameInvalidCharacter.Name);
        } else if (lastName.length > NAME_FIELD_LENGTH_160){
            // character count limit
            validationErrors.push(nameValidationType.LastNameLength.Name);
        }
    } else {
        validationErrors.push(nameValidationType.LastNameBlank.Name);
    }
}

const validateFormerNames = (formerNames: string, previousNamesRadio: string, nameValidationType: NameValidationType, validationErrors: ValidationError[]) => {
    if (!previousNamesRadio) {
        const errorMessage = lookupWebValidationMessage(formerNamesErrorMessageKey.FORMER_NAMES_RADIO_UNSELECTED);
        validationErrors.push(createValidationError(errorMessage, [DirectorField.PREVIOUS_NAMES_RADIO], DirectorField.YES));
    }
    else if (previousNamesRadio == DirectorField.YES) {
        if(formerNames != null && formerNames != "") {
            if (!formerNames.match(REGEX_FOR_VALID_CHARACTERS)){
                // invalid characters
                validationErrors.push(nameValidationType.PreviousNamesInvalidCharacter.Name);
            } else if (formerNames.length > NAME_FIELD_LENGTH_160){
                // character count limit
                validationErrors.push(nameValidationType.PreviousNamesLength.Name);
            }
        } else {
            const errorMessage = lookupWebValidationMessage(formerNamesErrorMessageKey.FORMER_NAMES_MISSING);
            validationErrors.push(createValidationErrorBasic(errorMessage, DirectorField.PREVIOUS_NAMES));
        }
    }
}