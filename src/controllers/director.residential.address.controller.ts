import { NextFunction, Request, Response } from "express";
import { DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PATH, IS_DIRECTOR_PERSONAL_INFORMATION_PROTECTED_PATH } from "../types/page.urls";
import { Templates } from "../types/template.paths";
import { urlUtils } from "../utils/url";
import { Session } from '@companieshouse/node-session-handler';
import { whereDirectorLiveErrorMessageKey } from '../utils/api.enumerations.keys';
import { createValidationErrorBasic, formatValidationErrors } from '../validation/validation';
import { ValidationError } from "../model/validation.model";

const directorAddressChoice = new Map();
const directorChoiceHtmlField: string = "director_address";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
      templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS,
      backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req),
      director_address: directorAddressChoice.get("director-address-choice")
    });
  } catch (e) {
    return next(e);
  }
};

export const post = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const selectedSraAddressChoice = req.body[directorChoiceHtmlField];

    const validationErrors = buildValidationErrors(req);
    if (validationErrors.length > 0) {
      const formattedErrors = formatValidationErrors(validationErrors);
      return res.render(Templates.DIRECTOR_RESIDENTIAL_ADDRESS, {
        templateName: Templates.DIRECTOR_RESIDENTIAL_ADDRESS,
        backLinkUrl: urlUtils.getUrlToPath(DIRECTOR_CONFIRM_CORRESPONDENCE_ADDRESS_PATH, req),
        errors: formattedErrors,
      });
    }

    directorAddressChoice.set("director-address-choice", selectedSraAddressChoice);
    let nextPageUrl = "";
    if (selectedSraAddressChoice === "director_service_address") {
      nextPageUrl = urlUtils.getUrlToPath(IS_DIRECTOR_PERSONAL_INFORMATION_PROTECTED_PATH, req);
      return res.redirect(nextPageUrl);
    }
    nextPageUrl = urlUtils.getUrlToPath(DIRECTOR_MANUAL_ADDRESS_LOOK_UP_PATH, req);
    return res.redirect(nextPageUrl);
  } catch (e) {
    return next(e);
  }
};

export const buildValidationErrors = (req: Request): ValidationError[] => {
  const validationErrors: ValidationError[] = [];
  if (req.body[directorChoiceHtmlField] === undefined){
    validationErrors.push(createValidationErrorBasic(whereDirectorLiveErrorMessageKey.NO_ADDRESS_RADIO_BUTTON_SELECTED, directorChoiceHtmlField));
  }
  return validationErrors;
};

