import { PAYMENT_FORECAST_FIRESTORE_PATH, PaymentForecastEntry } from '@socialincome/shared/src/types/payment-forecast';
import { buildProperties, useSnackbarController } from 'firecms';
import { EntityCollection } from 'firecms/dist/types/collections';
import { CreatePaymentForecastAction } from '../actions/CreatePaymentForecastAction';
import { buildAuditedCollection } from './shared';

export const buildPaymentForecastCollection = () => {
	const snackbarController = useSnackbarController();

	const collection: EntityCollection<PaymentForecastEntry> = {
		name: 'Payout Forecast',
		group: 'Finances',
		path: PAYMENT_FORECAST_FIRESTORE_PATH,
		textSearchEnabled: false,
		initialSort: ['order', 'asc'],
		icon: 'LocalConvenienceStore',
		description: 'Projected payout forecast for the next six months',
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
				validation: { required: true },
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
			amount_sle: {
				dataType: 'number',
				name: 'Total Amount SLE',
				validation: { required: true },
			},
		}),
	};
	return buildAuditedCollection<PaymentForecastEntry>(collection);
};
