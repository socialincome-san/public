import { Currency } from '../../../types/currency';

export type BankTransferPayment = {
	amount: number;
	currency: Currency;
	referenceId: string;
	interval: number;
};
