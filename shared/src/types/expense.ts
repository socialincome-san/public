export const EXPENSES_FIRESTORE_PATH = 'expenses';

export enum ExpenseType {
	AccountFees = 'account_fees',
	Administrative = 'administrative',
	DeliveryFees = 'delivery_fees',
	DonationFees = 'donation_fees',
	ExchangeRateLoss = 'exchange_rate_loss',
	FundraisingAdvertising = 'fundraising_advertising',
	Staff = 'staff',
}

export type Expense = {
	type: ExpenseType;
	year: number;
	amount_chf: number;
};
