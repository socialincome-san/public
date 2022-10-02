import { buildCollection, buildProperties } from '@camberi/firecms';
import { OrangeMoneyRecipient, ORANGE_MONEY_RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/types';

export const orangeMoneyRecipientsCollection = buildCollection<OrangeMoneyRecipient>({
	name: 'Orange Money Recipients',
	group: 'Finances',
	path: ORANGE_MONEY_RECIPIENT_FIRESTORE_PATH,
	alias: 'om-list',
	icon: 'RequestQuote',
	description: 'List of recipients for monthly payout list via Orange Money',
	textSearchEnabled: false,
	permissions: ({ authController }) => ({
		edit: false,
		create: false,
		delete: false,
	}),
	properties: buildProperties<OrangeMoneyRecipient>({
		om_phone_number: {
			name: 'OM Phone Number',
			dataType: 'number',
			disabled: true,
		},
		om_amount: {
			name: 'OM Amount',
			dataType: 'number',
			disabled: true,
		},
		first_name: {
			name: 'First Name',
			dataType: 'string',
			disabled: true,
		},
		last_name: {
			name: 'Last Name',
			dataType: 'string',
			disabled: true,
		},
		om_uid: {
			name: 'OM UID',
			dataType: 'number',
			disabled: true,
		},
		om_remarks: {
			name: 'OM Remarks',
			dataType: 'string',
			disabled: true,
		},
		om_user_type: {
			name: 'OM User Type',
			dataType: 'string',
			disabled: true,
		},
	}),
});
