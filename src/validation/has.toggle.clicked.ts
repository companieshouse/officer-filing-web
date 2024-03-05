import { NextFunction, Request, Response } from "express";
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

let globalError: ValidationError[] | undefined;
let globalUserData;

export const checkValidationToggle = (req: Request, res: Response, next: NextFunction) => {
  
  res.setErrorMessage =  function(error: ValidationError[]) {
    globalError = error;
  }
 
  res.getErrorMessage = function(currentUrl: string, referrerUrl: string, lang: string) {
    if (referrerUrl && !referrerUrl.includes(currentUrl.replace('/', ""))) {
      globalError = undefined;
    }
    return globalError ? formatValidationErrors(globalError, lang) : undefined;
  }

  res.setUserData =  function(req: Request) {
    globalUserData = req.body;
  }

  res.getUserData = function(currentUrl: string, referrerUrl: string) {
    if (referrerUrl && !referrerUrl.includes(currentUrl.replace('/', ""))) {
      globalUserData = undefined;
    }
    return globalUserData;
  }
  
  next();
}