import { Request } from "express";
/**
 * Get field from the form. If the field is populated then it will be returned, else undefined.
 */
export const getField = (req: Request, fieldName: string): string => {
  const field: string = req.body[fieldName];
  if (field && field.trim().length > 0) {
    return field;
  }
  return "";
};

/**
 * Map the country key returned by postcode lookup to a readable format
 */
export const getCountryFromKey = (country: string): string => {
  const countryKeyValueMap: Record<string, string> = {
    'GB-SCT': 'Scotland',
    'GB-WLS': 'Wales',
    'GB-ENG': 'England',
    'GB-NIR': 'Northern Ireland',
    'Channel Island': 'Channel Island',
    'Isle of Man': 'Isle of Man',
  };
  return countryKeyValueMap[country];
}