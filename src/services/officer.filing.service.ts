import { Session } from "@companieshouse/node-session-handler";
import { createPublicOAuthApiClient } from "./api.service";
import {
  Tm01Submission, OfficerFilingService
} from "@companieshouse/api-sdk-node/dist/services/officer-filing";

export const postTm01 = async (session: Session,transactionId: string) => {
    const client = createPublicOAuthApiClient(session);
    const ofService: OfficerFilingService = client.officerFiling;
    const ofSubmission: Tm01Submission = {
      resigned_on: new Date("23.03.23"),
      reference_etag: "2457cbbf8231cbdb1e20ac91c48d3847a0834124",
      reference_appointment_id: "4a9d7b42-8840-482e-ad10-8f17c05242a0"
  };
    const response = await ofService.postTm01(transactionId, ofSubmission);
};
