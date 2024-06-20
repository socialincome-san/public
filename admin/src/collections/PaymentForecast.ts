import { buildProperties } from 'firecms';
import { PaymentForecastEntry, PAYMENT_FORECAST_FIRESTORE_PATH } from '@socialincome/shared/src/types/payment-forecast';
import { buildAuditedCollection } from './shared';
import { CreatePaymentForecastAction } from '../actions/CreatePaymentForecastAction';

export const paymentForecastCollection = buildAuditedCollection<PaymentForecastEntry>({
	name: 'PaymentForecast',
	group: 'Finances',
	path: PAYMENT_FORECAST_FIRESTORE_PATH,
	textSearchEnabled: false,
	initialSort: ['order', 'asc'],
	icon: 'LocalAtm',
	description: 'Project expenses displayed on transparency page',
	Actions: CreatePaymentForecastAction,
	permissions: {
		edit: false,
		create: false,
		delete: false,
	},
	properties: buildProperties<PaymentForecastEntry>({
		order: {
			dataType: 'number',
			name: 'Order',
			validation: { required: true }
		},
		month: {
			dataType: 'string',
			name: 'Month',
			validation: { required: true },
		},
		numberOfRecipients: {
			dataType: 'number',
			name: 'Number of Recipients',
			validation: { required: true },
		},
		amount_usd: {
			dataType: 'number',
			name: 'Total Amount USD',
			validation: { required: true },
		},
	}),
});
