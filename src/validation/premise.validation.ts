import {PremiseValidationType, ValidationError} from "../model/validation.model";

const REGEX_FOR_PREMISE = /^[-,.:;A-Za-z0-9&@$£¥€'«»?!/\\()\[\]{}<>=#%+ÀÁÂÃÄÅĀĂĄÆÇĆĈĊČÞĎÐÈÉÊËĒĔĖĘĚĜĞĠĢĤĦÌÍÎÏĨĪĬĮİĴĶĹĻĽĿŁÑŃŅŇŊÒÓÔÕÖØŌŎŐŒŔŖŘŚŜŞŠŢŤŦÙÚÛÜŨŪŬŮŰŲŴẀẂẄỲÝŶŸŹŻŽa-zÀÖØſƒǺẀỲàáâãäåāăąæçćĉċčþďðèéêëēĕėęěĝģğġĥħìíîïĩīĭįĵķĺļľŀłñńņňŋòóôõöøōŏőœŕŗřśŝşšţťŧùúûüũūŭůűųŵẁẃẅỳýŷÿźżž\s]*$/;

export const validatePremise = (premise: string,
								premisesValidationType: PremiseValidationType,
								validationErrors: ValidationError[]): ValidationError[] => {
	//Premise validation
	if (premise != null) {
		const invalidPremisesCharacterValidationResult = validateInvalidCharacterValuesForPremise(premise, premisesValidationType);
		//Invalid characters
		if(invalidPremisesCharacterValidationResult) {
			validationErrors.push(invalidPremisesCharacterValidationResult);
			return validationErrors;
		}

		const invalidPremisesLengthValidationResult = validateLengthForPremise(premise, premisesValidationType);
		//Length validation
		if(invalidPremisesLengthValidationResult) {
			validationErrors.push(invalidPremisesLengthValidationResult);
			return validationErrors;
		}
	}
	return validationErrors;
}

/**
 * Validate the premise field and return a validation error if the field contains invalid characters
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateInvalidCharacterValuesForPremise = (premise: string, premiseValidationType : PremiseValidationType): ValidationError | undefined => {
	const regex = REGEX_FOR_PREMISE;
	const match = regex.exec(premise);	
	if (!match) {
		return premiseValidationType.InvalidCharacters.Premise;
	}
	return undefined;
}

/**
 * Validate the premise field and return a validation error if the field length is invalid
 * @returns A ValidationError object if one occurred, else undefined
 */
const validateLengthForPremise = (premise: string, premiseValidationType : PremiseValidationType): ValidationError | undefined => {
	if (premise.length > 200) {
		return premiseValidationType.InvalidLength.Premise;
	}
	return undefined;
}