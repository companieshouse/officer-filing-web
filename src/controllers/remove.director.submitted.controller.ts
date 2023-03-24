import { NextFunction, Request, Response } from "express";
import { Templates } from "../types/template.paths";
import { Session } from "@companieshouse/node-session-handler";
import { postTm01 } from "services/officer.filing.service";

export const get = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //Basic API connectivity test. Proper implementation will likely want to switch the template to show errors if they are returned.
    const session = req.session as Session;
    postTm01(session,"205625-972416-796670");
    return res.render(Templates.REMOVE_DIRECTOR_SUBMITTED, {
      templateName: Templates.REMOVE_DIRECTOR_SUBMITTED,
    });
  } catch (e) {
    return next(e);
  }
};
