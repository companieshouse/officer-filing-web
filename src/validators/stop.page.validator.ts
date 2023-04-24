import { getHasCessationDate } from "../services/stop.page.validation.service";
import { Session } from "@companieshouse/node-session-handler";

export const hasCessationDate = async (session: Session, companyNumber: string, transactionId: string): Promise<Boolean> => {
  const hasCessationDate: Boolean = await getHasCessationDate(session, companyNumber, transactionId);
  return hasCessationDate;
};
