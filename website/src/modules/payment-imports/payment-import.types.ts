import type { Currency } from '@/generated/prisma/enums';

export type BankContribution = {
	amount: number;
	currency: Currency;
	referenceId: string;
	rawContent: string;
};

export type PostFinanceBalance = {
	iban: string;
	amount: number;
	currency: Currency;
};
