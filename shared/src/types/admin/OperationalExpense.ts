export const OPERATIONAL_EXPENSE_FIRESTORE_PATH = 'operational-expenses';

export type OperationalExpense = {
	name: string;
	type: string;
	created: Date;
	amount_chf: number;
};
