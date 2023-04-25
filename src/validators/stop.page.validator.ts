import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { Session } from "@companieshouse/node-session-handler";

export const currentOrFutureDissolved = async (session: Session, companyNumber: string, transactionId: string): Promise<Boolean> => {
  const hasCessationDate: Boolean = await getCurrentOrFutureDissolved(session, companyNumber, transactionId);
  return hasCessationDate;
};
