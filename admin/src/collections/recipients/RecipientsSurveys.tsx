import { AdditionalFieldDelegate, buildProperties } from '@camberi/firecms';
import { EntityCollection } from '@camberi/firecms/dist/types';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { surveysCollection } from '../index';
import { buildAuditedCollection } from '../shared';
import {
	firstNameProperty,
	lastNameProperty,
	mobileMoneyPhoneProperty,
	orangeMoneyUIDProperty,
	programStatusProperty,
} from './RecipientsProperties';

export const buildRecipientsSurveysCollection = (
	additionalFields: AdditionalFieldDelegate<Partial<Recipient>, string, any>[]
) => {
	const collection: EntityCollection<Partial<Recipient>> = {
		additionalFields: additionalFields,
		alias: 'recipients',
		defaultSize: 'xs',
		description: 'Surveys for each recipient',
		group: 'Recipients',
		icon: 'RememberMeTwoTone',
		inlineEditing: false,
		name: 'Recipients',
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
