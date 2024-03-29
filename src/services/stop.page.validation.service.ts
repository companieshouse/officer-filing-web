import { getCompanyProfile } from "./company.profile.service";

export const getCurrentOrFutureDissolved = async (companyNumber: string): Promise<boolean> => {

    const companyProfile = await getCompanyProfile(companyNumber);
    
    return !!companyProfile.dateOfCessation || companyProfile.companyStatus === "dissolved";
}
