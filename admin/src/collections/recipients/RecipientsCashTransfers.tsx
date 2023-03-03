import { buildProperties } from '@camberi/firecms';
import { EntityCollection } from '@camberi/firecms/dist/types';
import { Recipient, RecipientProgramStatus, RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types';
import { isUndefined } from 'lodash';
import { BuildCollectionProps, paymentsCollection } from '../index';
import { buildAuditedCollection } from '../shared';
import { PaymentsLeft } from './Recipients';
import {
	firstNameProperty,
	genderProperty,
	lastNameProperty,
	mobileMoneyPhoneProperty,
	orangeMoneyUIDProperty,
	programStatusProperty,
} from './RecipientsProperties';

export const buildRecipientsCashTransfersCollection = ({ isGlobalAdmin, organisations }: BuildCollectionProps) => {
	let collection: EntityCollection<Partial<Recipient>> = {
		additionalFields: [PaymentsLeft],
		alias: 'recipients',
		defaultSize: 'xs',
		description: 'Lists of people, who receive a Social Income',
		initialFilter: {
			progr_status: ['in', [RecipientProgramStatus.Active, RecipientProgramStatus.Designated]],
		},
		group: 'Recipients',
		// initialSort: ['om_uid', 'asc'], TODO: figure out how to sort and filter
		icon: 'RememberMeTwoTone',
		inlineEditing: false,
		name: 'Recipients',
		path: RECIPIENT_FIRESTORE_PATH,
		properties: buildProperties<Partial<Recipient>>({
			om_uid: orangeMoneyUIDProperty,
			progr_status: programStatusProperty,
			first_name: firstNameProperty,
			last_name: lastNameProperty,
			mobile_money_phone: { ...mobileMoneyPhoneProperty, hideFromCollection: true },
			gender: genderProperty,
		}),
		singularName: 'Recipient',
		subcollections: [paymentsCollection],
		textSearchEnabled: true,
	};

	if (!isGlobalAdmin) {
		collection = {
			...collection,
			callbacks: {
				onPreSave: ({ previousValues, values }) => {
					if (!values?.organisation?.id || organisations?.map((o) => o.id).indexOf(values.organisation.id) === -1) {
						throw Error('Please select a valid organisation.');
					}
					if (isUndefined(previousValues)) {
						values.progr_status = RecipientProgramStatus.Waitlisted;
					}
					return values;
				},
			},
			forceFilter: {
				...collection.forceFilter,
				organisation: ['in', organisations || []],
			},
		};
	}
	return buildAuditedCollection(collection);
};
