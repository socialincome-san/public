import { Currency } from '@/generated/prisma/enums';

export type BankTransferPayment = {
	amount: number;
	currency: Currency;
	referenceId: string;
	interval: number;
};
