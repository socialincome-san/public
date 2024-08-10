export const PAYMENT_FORECAST_FIRESTORE_PATH = 'payment-forecast';

export type PaymentForecastEntry = {
	order: number;
	month: string;
	numberOfRecipients: number;
	amount_usd: number;
	amount_sle: number;
};
