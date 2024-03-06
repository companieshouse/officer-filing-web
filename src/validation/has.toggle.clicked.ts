import { NextFunction, Request, Response, application } from "express";
import { FormattedValidationErrors, ValidationError } from "../model/validation.model";
import { formatValidationErrors } from "./validation";


declare global {
  namespace Express {
    interface Response {
      setErrorMessage: (errors: ValidationError[]) => void;
      getErrorMessage: (currentUrl: string, referrerUrl: string, lang: string) => FormattedValidationErrors | undefined;
      setUserData: (req: Request) => void;
      getUserData: (currentUrl: string, referrerUrl: string) => Request
    }
  }
}

export const checkValidationToggle = (req: Request, res: Response, next: NextFunction) => {

  res.setErrorMessage = (error: ValidationError[]) => {
    req.app.locals.errorMessage = error;
  } 
 
  res.getErrorMessage = function(currentUrl: string, referrerUrl: string, lang: string) {
    if (referrerUrl && !referrerUrl.includes(currentUrl.replace('/', ""))) {
      delete req.app.locals.errorMessage;
    }
    return req.app.locals.errorMessage ? formatValidationErrors(req.app.locals.errorMessage, lang) : undefined;
  }

  res.setUserData =  function(req: Request) {
    req.app.locals.userData = req.body;
  }

  res.getUserData = function(currentUrl: string, referrerUrl: string) {
    if (referrerUrl && !referrerUrl.includes(currentUrl.replace('/', ""))) {
      delete req.app.locals.userData;
    }
    return req.app.locals.userData;
  }
  next();
}