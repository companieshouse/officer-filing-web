import { NextFunction, Request, Response } from "express";
import { NameValidationType, ValidationError } from "../model/validation.model";
import { getField, setBackLink } from "../utils/web";
import { TITLE_LIST } from "../utils/properties";
import { DirectorField } from "../model/director.model";
import { NameValidation } from "./name.validation.config";
import { formatValidationErrors } from "./validation";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { CURRENT_DIRECTORS_PATH } from "../types/page.urls";
import { getOfficerFiling, patchOfficerFiling } from "../services/officer.filing.service";

const REGEX_FOR_NAMES = /^[-,.:; 0-9A-Z&@$£¥€'"«»''""?!/\\()[\]{}<>*=#%+ÀÁÂÃÄÅĀĂĄÆǼÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐǾŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲàáâãäåāăąæǽçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőǿœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž]*$/;
const NAME_FIELD_LENGTH_50 = 50;
const NAME_FIELD_LENGTH_160 = 160;

export const nameValidator = async (req: Request, res: Response, next: NextFunction) => {
    console.log("ANONA: Entering frontend validation");
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

        console.log("ANONA: Running validateName");
        const frontendValidationErrors = validateName(title, firstName, middleNames, lastName, formerNames, NameValidation);

        if(frontendValidationErrors) {
            console.log("ANONA: Found validation errors");
            const formattedErrors = formatValidationErrors([frontendValidationErrors]);

            (formattedErrors.errorList).forEach((error) => {
                console.log("ANONA: Error: " + error.text);
            })
            console.log("ANONA: Formatted validation errors: " + formattedErrors.errorList[0].text);
            return res.render(Templates.DIRECTOR_NAME, {
                templateName: Templates.DIRECTOR_NAME,
                backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink, urlUtils.getUrlToPath(CURRENT_DIRECTORS_PATH, req)),
                typeahead_array: TITLE_LIST,
                errors: formattedErrors,
                typeahead_errors: JSON.stringify(formattedErrors),
                typeahead_value: title,
                first_name: firstName,
                middle_names: middleNames,
                last_name: lastName,
                previous_names: formerNames,
                previous_names_radio: previousNamesRadio,
            });
          }
        return next();

    } catch(error) {
        next(error);
    }
};

export const validateName = (title: string, firstName: string, middleNames: string, lastName: string, formerNames: string, nameValidationType: NameValidationType): ValidationError | undefined => {
    if(title != null && title != "") {
        if (!title.match(REGEX_FOR_NAMES)){
            return nameValidationType.TitleInvalidCharacter.Name;
        }
        if (title.length > NAME_FIELD_LENGTH_50){
            return nameValidationType.TitleLength.Name;
        }
    }

    if(firstName != null && firstName != "") {
        if (!firstName.match(REGEX_FOR_NAMES)){
            return nameValidationType.FirstNameInvalidCharacter.Name;
        }
        if (firstName.length > NAME_FIELD_LENGTH_50){
            return nameValidationType.FirstNameLength.Name;
        }
    } else {
        return nameValidationType.FirstNameBlank.Name;
    }

    if(middleNames != null && middleNames != "") {
        if (!middleNames.match(REGEX_FOR_NAMES)){
            return nameValidationType.MiddleNamesInvalidCharacter.Name;
        }
        if (middleNames.length > NAME_FIELD_LENGTH_50){
            return nameValidationType.MiddleNamesLength.Name;
        }
    }

    if(lastName != null && lastName != "") {
        if (!lastName.match(REGEX_FOR_NAMES)){
            return nameValidationType.LastNameInvalidCharacter.Name;
        }
        if (lastName.length > NAME_FIELD_LENGTH_160){
            return nameValidationType.LastNameLength.Name;
        }
    } else {
        return nameValidationType.LastNameBlank.Name;
    }

    if(formerNames != null && formerNames != "") {
        if (!formerNames.match(REGEX_FOR_NAMES)){
            return nameValidationType.FormerNamesInvalidCharacter.Name;
        }
        if (formerNames.length > NAME_FIELD_LENGTH_160){
            return nameValidationType.FormerNamesLength.Name;
        }
    }
    // return list
};