import { body } from "express-validator";
import { VALID_CHARACTERS } from "./regex/regex.validation";

const checkMultipleNationality = (nationality: string = "", secondNationality: string = "", thirdNationality: string = "", errors?: string) => {

  if ( nationality && nationality === secondNationality ) {
    throw new Error("nationality cannot be thesame" ?? 'Must be different from first nationality');
  } else if (nationality && secondNationality && (thirdNationality === nationality || thirdNationality === secondNationality)) {
    throw new Error("nationality cannot be thesame" ?? 'Must be different from first and second nationality');
  } else if ( nationality && secondNationality && thirdNationality && `${nationality},${secondNationality},${secondNationality}`.length > 50) {
    // throw new Error(errors?.lengthError ?? 'Cannot be greater than 50');
    throw new Error('' ?? 'Cannot be greater than 50');
  }
  return true;
};

const second_nationality_validations = (errors?: string) => [
  body("typeahead_input_1" || "typeahead_input_2")
  .matches(VALID_CHARACTERS).withMessage("second nationality empty")
    .custom((_, { req }) => checkMultipleNationality(req.body["typeahead_input_0"], req.body["typeahead_input_1"], req.body["typeahead_input_2"], errors))
];


export const nationalityValidator = [
  body("typeahead_input_0")
  .not().isEmpty({ ignore_whitespace: true }).withMessage('Empty')
  .isLength({ max: 256 }).withMessage('Exceeded length')
  .matches(VALID_CHARACTERS).withMessage("Invalid character"),

  ...second_nationality_validations()
]




