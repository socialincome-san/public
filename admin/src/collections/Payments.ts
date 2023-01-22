import { buildCollection, buildEnumValueConfig, buildProperties } from '@camberi/firecms';
import { Payment, PAYMENT_FIRESTORE_PATH } from '../../../shared/src/types';

export const paymentStatusMap = {
	to_pay: buildEnumValueConfig({
		id: 'to_pay',
		label: 'To Be Paid',
		color: 'yellowLight',
	}),
	to_be_confirmed: buildEnumValueConfig({
		id: 'to_be_confirmed',
		label: 'To Be Confirmed',
		color: 'redLight',
	}),
	confirmed: buildEnumValueConfig({
		id: 'confirmed',
		label: 'Confirmed',
		color: 'greenDark',
	}),
	contested: buildEnumValueConfig({
		id: 'contested',
		label: 'Contested',
		color: 'orangeDark',
	}),
	failed: buildEnumValueConfig({
		id: 'failed',
		label: 'Failed Confirmation',
		color: 'redDarker',
	}),
	no_payment: buildEnumValueConfig({
		id: 'no_payment',
		label: 'No Payment',
		color: 'grayDark',
	}),
};

export const paymentsCollection = buildCollection<Payment>({
	name: 'Payments',
	group: 'Finances',
	path: PAYMENT_FIRESTORE_PATH,
	textSearchEnabled: false,
	initialSort: ['payment_at', 'desc'],
	customId: true,
	permissions: ({ authController }) => ({
		edit: true,
		create: true,
		delete: true,
	}),
	properties: buildProperties<Payment>({
		amount: {
			dataType: 'number',
			name: 'Amount',
			validation: { required: true },
		},
		currency: {
			dataType: 'string',
			name: 'Currency',
			enumValues: {
				SLL: 'SLL',
				SLE: 'SLE',
			},
			validation: { required: true },
		},
		payment_at: {
			dataType: 'date',
			name: 'Payment Date',
			mode: 'date',
		},
		status: {
			dataType: 'string',
			name: 'Status',
			enumValues: paymentStatusMap,
			validation: { required: true },
		},
		confirm_at: {
			dataType: 'date',
			name: 'Confirm Date',
			mode: 'date',
		},
		contest_at: {
			dataType: 'date',
			name: 'Contest Date',
			mode: 'date',
		},
		contest_reason: {
			dataType: 'string',
			name: 'Contest Reason',
		},
	}),
});
