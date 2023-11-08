import { MESSAGE_FIRESTORE_PATH } from '@socialincome/shared/src/types/message';
import { Payment, PAYMENT_FIRESTORE_PATH, PaymentStatus } from '@socialincome/shared/src/types/payment';
import { buildProperties, EnumValues } from 'firecms';
import { buildAuditedCollection } from './shared';

export const paymentStatusEnumValues: EnumValues = [
	{ id: PaymentStatus.Created, label: 'Created', color: 'yellowLight' },
	{ id: PaymentStatus.Paid, label: 'Paid', color: 'redLight' },
	{ id: PaymentStatus.Confirmed, label: 'Confirmed', color: 'greenDark' },
	{ id: PaymentStatus.Contested, label: 'Contested', color: 'orangeDark' },
	{ id: PaymentStatus.Failed, label: 'Failed', color: 'redDarker' },
	{ id: PaymentStatus.Other, label: 'Other', color: 'grayDark' },
];

export const paymentsCollection = buildAuditedCollection<Payment>({
	name: 'Payments',
	group: 'Finances',
	path: PAYMENT_FIRESTORE_PATH,
	textSearchEnabled: false,
	initialSort: ['payment_at', 'desc'],
	customId: true,
	permissions: {
		edit: true,
		create: true,
		delete: true,
	},
	properties: buildProperties<Payment>({
		status: {
			dataType: 'string',
			name: 'Status',
			enumValues: paymentStatusEnumValues,
			validation: { required: true },
		},
		amount: {
			dataType: 'number',
			name: 'Amount',
			validation: { required: true },
		},
		amount_chf: {
			dataType: 'number',
			name: 'Amount CHF (exchange rate at payout date)',
			readOnly: true,
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
			// @ts-ignore TODO: fix typing
			dataType: 'date',
			name: 'Payment Date',
			mode: 'date',
		},
		phone_number: {
			dataType: 'number',
			name: 'Phone Number',
		},
		comments: {
			dataType: 'string',
			name: 'Comment',
		},
		message: {
			dataType: 'reference',
			name: 'Payment Notification Reference',
			path: MESSAGE_FIRESTORE_PATH,
		},
	}),
});
