import { body } from "express-validator";
import {
  checkDateFieldDay,
  checkDateFieldMonth,
  checkDateFieldYear
} from "../date.validation";

// to prevent more than 1 error reported on the date fields we check if the date is valid before doing some checks.
// This means that the date check is checked before some others
export const removalDataValidations = [
  body("removal_date-day")
    .custom((value, { req }) => checkDateFieldDay(req.body["removal_date-day"], req.body["removal_date-month"], req.body["removal_date-year"])),
  body("removal_date-month")
    .custom((value, { req }) => checkDateFieldMonth(req.body["removal_date-day"], req.body["removal_date-month"], req.body["removal_date-year"])),
  body("removal_date-year")
    .custom((value, { req }) => checkDateFieldYear(req.body["removal_date-day"], req.body["removal_date-month"], req.body["removal_date-year"]))
];


