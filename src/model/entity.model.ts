export const EntityKey = "entity";

/*
  The Entity fields will have to match the name field on the HTML file to
  be able to do the mapping correctly
*/
export const EntityKeys: string[] = [
  "incorporation_country",
  "principal_address",
  "is_service_address_same_as_principal_address",
  "service_address",
  "email",
  "legal_form",
  "law_governed",
  "public_register_name",
  "public_register_jurisdiction",
  "registration_number",
  "is_on_register_in_country_formed_in"
];

export interface Entity {
    incorporation_country?: string;
}
