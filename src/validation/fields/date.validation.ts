import { body } from "express-validator";
import {
  checkDateFieldDay,
  checkDateFieldMonth,
  checkDateFieldYear,
  checkRemovalDate
} from "../custom.validation";
import { ErrorMessages } from "../error.messages";

// to prevent more than 1 error reported on the date fields we check if the date is valid before doing some checks.
// This means that the date check is checked before some others
export const removalDataValidations = [
  body("removal_date-day")
    .custom((value, { req }) => checkDateFieldDay(req.body["removal_date-day"], req.body["removal_date-month"], req.body["removal_date-year"])),
  body("removal_date-month")
    .custom((value, { req }) => checkDateFieldMonth(ErrorMessages.MONTH, req.body["removal_date-day"], req.body["removal_date-month"])),
  body("removal_date-year")
    .custom((value, { req }) => checkDateFieldYear(ErrorMessages.YEAR, req.body["removal_date-day"], req.body["removal_date-month"], req.body["removal_date-year"])),
  body("removal_date")
    .custom((value, { req }) => checkRemovalDate(req.body["removal_date-day"], req.body["removal_date-month"], req.body["removal_date-year"])),
];


