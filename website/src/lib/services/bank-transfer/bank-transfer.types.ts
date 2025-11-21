import { Currency } from '@socialincome/shared/src/types/currency';

export type BankTransferPayment = {
	amount: number;
	currency: Currency;
	referenceId: string;
	interval: number;
};
