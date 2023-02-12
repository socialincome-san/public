import { Property } from "@camberi/firecms/dist/types/properties";
import { PARTNER_ORGANISATION_FIRESTORE_PATH, RecipientProgramStatus } from "@socialincome/shared/src/types";

export const programStatusProperty: Property = {
  name: "Status",
  dataType: "string",
  disabled: true,
  enumValues: [
    { id: RecipientProgramStatus.Active, label: "Active Recipient" },
    { id: RecipientProgramStatus.Waitlisted, label: "Waiting List" },
    { id: RecipientProgramStatus.Designated, label: "Starting Next Payday" },
    { id: RecipientProgramStatus.Former, label: "Former Recipient" }
  ]
};
export const orangeMoneyUIDProperty: Property = {
  name: "OM ID",
  dataType: "number",
};
export const firstNameProperty: Property = {
  name: "First Name",
  validation: { required: true },
  dataType: "string",
};
export const lastNameProperty: Property = {
  name: "Last Name",
  validation: { required: true },
  dataType: "string",
};
export const communicationMobilePhoneProperty: Property = {
  name: "Contact Phone",
  validation: { required: true },
  dataType: "map",
  spreadChildren: true,
  properties: {
    phone: {
      name: "Phone Number",
      dataType: "number",
      hideFromCollection: true
    },
    equals_mobile_money: {
      name: "# used for Orange Money",
      dataType: "boolean",
      hideFromCollection: true
    },
    has_whatsapp: {
      name: "# used on WhatsApp",
      dataType: "boolean",
      hideFromCollection: true
    }
  }
};
export const mobileMoneyPhoneProperty: Property = {
  name: "Separate Orange Money Phone",
  dataType: "map",
  spreadChildren: true,
  properties: {
    phone: {
      name: "Orange Money Number",
      dataType: "number",
          validation: { required: true, min: 23200000000, max: 23299999999 }
    },
    has_whatsapp: {
      name: "WhatsApp",
      dataType: "boolean",
      hideFromCollection: true
    }
  }
};
export const genderProperty: Property = {
  name: "Gender",
  dataType: "string",
  longDescription: "Gender of recipient",
  validation: { required: true },
  enumValues: {
    male: "Male",
    female: "Female",
    other: "Other",
    private: "Private"
  }
};
export const mainLanguageProperty: Property = {
  name: "First Language",
  dataType: "string",
  validation: { required: true },
  enumValues: {
    krio: "Krio",
    mende: "Mende",
    temne: "Temne",
    limba: "Limba",
    english: "English",
    other: "Other"
  }
};
export const speaksEnglishProperty: Property = {
  name: "Speaks English",
  dataType: "boolean",
  hideFromCollection: true
};
export const birthDateProperty: Property = {
  name: "Birthday",
  dataType: "date",
  mode: "date"
};
export const callingNameProperty: Property = {
  name: "Nickname",
  dataType: "string",
  hideFromCollection: true
};
export const professionProperty: Property = {
  name: "Profession",
  dataType: "string",
  hideFromCollection: true
};
export const organisationProperty: Property = {
  name: "Recommending Organisation",
  dataType: "reference",
  path: PARTNER_ORGANISATION_FIRESTORE_PATH
};
export const updatedOnProperty: Property = {
  dataType: "date",
  name: "Updated",
  autoValue: "on_update"
};

export const emailProperty: Property = {
  name: "Email",
  dataType: "string",
  hideFromCollection: true
};
export const InstagramProperty: Property = {
  name: "Instagram",
  dataType: "string",
  hideFromCollection: true
};

export const TwitterProperty: Property = {
  name: "Twitter",
  dataType: "string",
  hideFromCollection: true
};

export const IMUIDProperty: Property = {
  name: "IM UID",
  dataType: "string",
  hideFromCollection: true
};
export const IMLinkProperty: Property = {
  name: "IM Link",
  dataType: "string",
  url: true
};
export const IMInitialProperty: Property = {
  name: "IM Initial",
  dataType: "string",
  url: true
};
export const IMLinkRegularProperty: Property = {
  name: "IM Regular",
  dataType: "string",
  url: true
};
export const IsSuspendedProperty: Property = {
  name: "Suspended",
  dataType: "boolean",
  hideFromCollection: true
};
export const SIStartDateProperty: Property = {
  name: "Start",
  dataType: "date",
  mode: "date"
};
export const TestRecipientProperty: Property = {
  name: "Test Recipient",
  dataType: "boolean",
  hideFromCollection: true
};