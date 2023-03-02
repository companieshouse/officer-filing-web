import { Request, Response } from "express";
import { COMPANY_LOOKUP } from "../types/page.urls";

export const get = (req: Request, res: Response) => {
  return res.redirect(COMPANY_LOOKUP);
};
