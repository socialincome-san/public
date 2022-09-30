export const BANK_BALANCE_FIRESTORE_PATH = 'postfinance-balances';

export type BankBalance = {
	account: string;
	balance: number;
	currency: string;
	timestamp: number;
};

export const getIdFromBankBalance = (balance: BankBalance) => {
	return `${balance.account}_${balance.timestamp}`;
};
