import { type Currency } from '@/generated/prisma/client';

export type PostFinanceBalance = {
	iban: string;
	amount: number;
	currency: Currency;
};
