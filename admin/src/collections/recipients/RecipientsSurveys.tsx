import { Recipient, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { AdditionalFieldDelegate, buildProperties } from 'firecms';
import { EntityCollection } from 'firecms/dist/types';
import { surveysCollection } from '../index';
import { buildAuditedCollection } from '../shared';
import {
	firstNameProperty,
	lastNameProperty,
	mobileMoneyPhoneProperty,
	orangeMoneyUIDProperty,
	programStatusProperty,
} from './RecipientsProperties';

export const buildRecipientsSurveysCollection =
	(name: string, alias: string) => (additionalFields: AdditionalFieldDelegate<Partial<Recipient>, string, any>[]) => {
		const collection: EntityCollection<Partial<Recipient>> = {
			additionalFields: additionalFields,
			alias: alias,
			defaultSize: 'xs',
			group: 'Surveys',
			icon: 'PollTwoTone',
			inlineEditing: false,
			name: name,
			path: RECIPIENT_FIRESTORE_PATH,
			properties: buildProperties<Partial<Recipient>>({
				om_uid: orangeMoneyUIDProperty,
				progr_status: programStatusProperty,
				first_name: firstNameProperty,
				last_name: lastNameProperty,
				mobile_money_phone: mobileMoneyPhoneProperty,
			}),
			singularName: 'Recipient',
			subcollections: [surveysCollection],
			textSearchEnabled: true,
		};
		return buildAuditedCollection(collection);
	};
