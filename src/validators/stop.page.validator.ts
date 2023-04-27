import { getCurrentOrFutureDissolved } from "../services/stop.page.validation.service";
import { Session } from "@companieshouse/node-session-handler";

export const currentOrFutureDissolved = async (session: Session, companyNumber: string): Promise<Boolean> => {
  const hasCessationDate: Boolean = await getCurrentOrFutureDissolved(session, companyNumber);
  return hasCessationDate;
};
