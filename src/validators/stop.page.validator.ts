import { hasCessationDate } from "../services/stop.page.validation.service";
import { Session } from "@companieshouse/node-session-handler";

export const isDissolved = async (session: Session, companyNumber: string): Promise<Boolean> => {
  const dissolved: Boolean = await hasCessationDate(session, companyNumber);
  return dissolved;
};
