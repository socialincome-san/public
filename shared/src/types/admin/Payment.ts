export const PAYMENT_FIRESTORE_PATH = 'payments';

export type Payment = {
	amount: number;
	currency: string;
	payment_at: Date;
	status: string; // TODO: proper typing
	confirm_at: Date;
	contest_at: Date;
	contest_reason: string;
};
