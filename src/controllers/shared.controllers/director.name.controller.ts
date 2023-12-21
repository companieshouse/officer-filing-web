import { NextFunction, Response, Request } from "express";
import { urlUtils } from '../../utils/url';
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling, patchOfficerFiling } from "../../services/officer.filing.service";
import { getField, setBackLink, setRedirectLink } from "../../utils/web";
import { TITLE_LIST } from "../../utils/properties";
import { DirectorField } from "../../model/director.model";
import { OfficerFiling } from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const getDirectorName = async (req: Request, res: Response, next: NextFunction, templateName: string, backUrlPath: string, isUpdate?: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(templateName, {
      templateName: templateName,
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(backUrlPath, req)),
      optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
      typeahead_array: TITLE_LIST,
      typeahead_value: officerFiling.title,
      first_name: officerFiling.firstName,
      middle_names: officerFiling.middleNames,
      last_name: officerFiling.lastName,
      previous_names: officerFiling.formerNames,
      previous_names_radio: calculatePreviousNamesRadioFromFiling(officerFiling.formerNames),
      isUpdate
    });
  } catch(e) {
    return next(e)
  }
}

export const postDirectorName = async (req: Request, res: Response, next: NextFunction, nextPageUrl: string, isUpdate: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;

    const officerFiling: OfficerFiling = {
      title: getField(req, DirectorField.TITLE),
      firstName: getField(req, DirectorField.FIRST_NAME),
      middleNames: getField(req, DirectorField.MIDDLE_NAMES),
      lastName: getField(req, DirectorField.LAST_NAME),
      formerNames: getPreviousNamesForFiling(req),
    };

    if (isUpdate) {
      const currentOfficerFiling = await getOfficerFiling(session, transactionId, submissionId);
      if (currentOfficerFiling.title != officerFiling.title || currentOfficerFiling.firstName != officerFiling.firstName || 
        currentOfficerFiling.middleNames != officerFiling.middleNames || currentOfficerFiling.lastName != officerFiling.lastName) {
          officerFiling.nameHasBeenUpdated = true;
      }
    };

    const patchFiling = await patchOfficerFiling(session, transactionId, submissionId, officerFiling);

    const nextPage = urlUtils.getUrlToPath(nextPageUrl, req);
  
    return res.redirect(await setRedirectLink(req, patchFiling.data.checkYourAnswersLink, nextPage));

  } catch(e) {
    return next(e);
  }
}

/**
 * Calculate the state of the previous names radio buttons based on what is saved within former names in the filing
 * @returns The value to set for the radio button on the page
 */
const calculatePreviousNamesRadioFromFiling = (formerNames: string | undefined): string | undefined => {
  if (formerNames === null) {
    return undefined;
  }
  if (formerNames === "") {
    return DirectorField.NO;
  }
  return DirectorField.YES;
}

/**
 * Get previous names value to save on the filing. This value is dependent on the radio button choice.
 * @returns The string|undefined value to save on the filing
 */
const getPreviousNamesForFiling = (req: Request): string|undefined => {
  let previousNames = getField(req, DirectorField.PREVIOUS_NAMES);
  let previousNamesRadio = getField(req, DirectorField.PREVIOUS_NAMES_RADIO);

  if (previousNamesRadio == DirectorField.YES) {
    return previousNames;
  }
  if (previousNamesRadio == DirectorField.NO) {
    return "";
  }
}