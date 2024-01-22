export const EXPENSES_FIRESTORE_PATH = 'expenses';

export enum ExpenseType {
	DonationFees = 'donation_fees',
	DeliveryFees = 'delivery_fees',
	ExchangeRateFluctuation = 'exchange_rate_fluctuation',
}

export type Expense = {
	type: ExpenseType;
	year: number;
	amount_chf: number;
};
