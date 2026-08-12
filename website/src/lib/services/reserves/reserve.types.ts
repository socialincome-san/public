import { type Currency } from '@/generated/prisma/client';

export type ReserveCreateInput = {
	bankAccountId: string;
	amount: number;
	currency: Currency;
	amountChf: number;
};
