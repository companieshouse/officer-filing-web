import { NextFunction, Request, Response } from "express"
import { urlUtils } from "../../utils/url";
import { Session } from "@companieshouse/node-session-handler";
import { getOfficerFiling } from "../../services/officer.filing.service";
import { setBackLink } from "../../utils/web";
import { NATIONALITY_LIST } from "../../utils/properties";
import { formatTitleCase, retrieveDirectorNameFromFiling } from "../../utils/format";

export const getDirectorNationality = async (req: Request, res: Response, next: NextFunction, template: string, backUrlPath: string, isUpdate?: boolean) => {
  try {
    const transactionId = urlUtils.getTransactionIdFromRequestParams(req);
    const submissionId = urlUtils.getSubmissionIdFromRequestParams(req);
    const session: Session = req.session as Session;
    const officerFiling = await getOfficerFiling(session, transactionId, submissionId);
    return res.render(template, {
      templateName: template,
      backLinkUrl: setBackLink(req, officerFiling.checkYourAnswersLink,urlUtils.getUrlToPath(backUrlPath, req)),
      optionalBackLinkUrl: officerFiling.checkYourAnswersLink,
      typeahead_array: NATIONALITY_LIST + "|" + NATIONALITY_LIST + "|" + NATIONALITY_LIST,
      typeahead_value: officerFiling.nationality1 + "|" + officerFiling.nationality2 + "|" + officerFiling.nationality3,
      directorName: formatTitleCase(retrieveDirectorNameFromFiling(officerFiling)),
      nationality2_hidden: officerFiling.nationality2Link,
      nationality3_hidden: officerFiling.nationality3Link
    });
  } catch (e) {
    return next(e);
  }
};