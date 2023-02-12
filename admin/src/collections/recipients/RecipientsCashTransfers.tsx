import { BuildCollectionProps, paymentsCollection } from "../index";
import { Recipient, RECIPIENT_FIRESTORE_PATH, RecipientProgramStatus } from "@socialincome/shared/src/types";
import { buildCollection, buildProperties } from "@camberi/firecms";
import { CreateOrangeMoneyCSVAction } from "../../actions/CreateOrangeMoneyCSVAction";
import { isUndefined } from "lodash";
import {
  PaymentsLeft
} from "./Recipients";
import { EntityCollection } from "@camberi/firecms/dist/types";
import {
  firstNameProperty,
  genderProperty,
  lastNameProperty,
  mobileMoneyPhoneProperty, orangeMoneyUIDProperty, programStatusProperty,
  updatedOnProperty
} from "./RecipientsProperties";


export const buildRecipientsCashTransfersCollection = ({ isGlobalAdmin, organisations }: BuildCollectionProps) => {
  let collection: EntityCollection<Partial<Recipient>> = {
    additionalFields: [PaymentsLeft],
    alias: "recipients",
    defaultSize: 'xs',
    description: "Lists of people, who receive a Social Income",
    initialFilter: {
      progr_status : ['in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated]]
    },
    group: "Recipients",
    // initialSort: ["om_uid", "desc"], TODO: support filtering and sorting
    icon: "RememberMeTwoTone",
    inlineEditing: false,
    name: "Recipients",
    path: RECIPIENT_FIRESTORE_PATH,
    properties: buildProperties<Partial<Recipient>>( {
      om_uid: orangeMoneyUIDProperty,
      progr_status: programStatusProperty,
      first_name: firstNameProperty,
      last_name: lastNameProperty,
      mobile_money_phone: {...mobileMoneyPhoneProperty, hideFromCollection: true},
      gender: genderProperty,
      updated_on: updatedOnProperty
    }),
    singularName: "Recipient",
    subcollections: [paymentsCollection],
    textSearchEnabled: true,
  };

  if (isGlobalAdmin) {
    collection = {
      ...collection,
      Actions: [CreateOrangeMoneyCSVAction],
    };
  } else {
    collection = {
      ...collection,
      callbacks: {
        onPreSave: ({ previousValues, values }) => {
          if (!values?.organisation?.id || organisations?.map((o) => o.id).indexOf(values.organisation.id) === -1) {
            throw Error("Please select a valid organisation.");
          }
          if (isUndefined(previousValues)) {
            values.progr_status = RecipientProgramStatus.Waitlisted;
          }
          return values;
        }
      },
      forceFilter: {
        ...collection.forceFilter,
        organisation: ["in", organisations || []]
      }
    };
  }
  return buildCollection(collection)
};
