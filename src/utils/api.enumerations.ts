import * as fs from "fs";
import * as yaml from "js-yaml";

interface ApiEnumerationsConstants {
  [propName: string]: any
}

const apiConstantsFile = fs.readFileSync("api-enumerations/constants.yml", "utf8");
const apiConstants: ApiEnumerationsConstants = yaml.load(apiConstantsFile) as ApiEnumerationsConstants;

const pscDescriptionsFile = fs.readFileSync("api-enumerations/psc_descriptions.yml", "utf8");
const pscDescriptions: ApiEnumerationsConstants = yaml.load(pscDescriptionsFile) as ApiEnumerationsConstants;

export const lookupCompanyType = (companyTypeKey: string): string => {
  return apiConstants.company_type[companyTypeKey] || companyTypeKey;
};

export const lookupCompanyStatus = (companyStatusKey: string): string => {
  return apiConstants.company_status[companyStatusKey] || companyStatusKey;
};

export const lookupSicCodeDescription = (sicCode: string): string => {
  return apiConstants.sic_descriptions[sicCode] || sicCode;
};

export const lookupPscStatementDescription = (pscStatementKey: string): string => {
  return pscDescriptions.statement_description[pscStatementKey] || pscStatementKey;
};

export const lookupIdentificationType = (identificationTypeKey: string): string => {
  return apiConstants.identification_type[identificationTypeKey] || identificationTypeKey;
};
