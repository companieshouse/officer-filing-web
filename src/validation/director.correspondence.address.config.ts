import { DirectorField } from "../model/director.model";
import { GenericValidationType } from "../model/validation.model";
import { correspondenceAddressErrorMessageKey } from "../utils/api.enumerations.keys";

export const CorrespondenceAddressValidation: GenericValidationType = {
  AddressBlank: {
    ErrorField: {
      messageKey: correspondenceAddressErrorMessageKey.CORRESPONDENCE_ADDRESS_BLANK,
      source: [DirectorField.CORRESPONDENCE_ADDRESS_RADIO],
      link: DirectorField.CORRESPONDENCE_ADDRESS_RADIO
    }
  }
}