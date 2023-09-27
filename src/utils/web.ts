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