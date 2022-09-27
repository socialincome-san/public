export interface BankBalance {
	account: string;
	balance: number;
	currency: string;
	timestamp: number;
}

export const path = 'postfinance-balances';

export const id = (balance: BankBalance) => {
	return `${balance.account}_${balance.timestamp}`;
};
