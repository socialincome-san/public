export const EXPENSES_FIRESTORE_PATH = 'expenses';

export enum ExpenseType {
	AccountFees = 'account_fees',
	Administrative = 'Administrative',
	DeliveryFees = 'delivery_fees',
	DonationFees = 'donation_fees',
	ExchangeRateLoss = 'exchange_rate_loss',
	FundraisingAdvertising = 'FundraisingAdvertising',
	Staff = 'staff',
}

export type Expense = {
	type: ExpenseType;
	year: number;
	amount_chf: number;
};
