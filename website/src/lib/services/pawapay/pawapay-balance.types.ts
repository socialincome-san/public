import { type Currency } from '@/generated/prisma/client';

export type PawaPayBalance = {
	country: string;
	amount: number;
	currency: Currency;
};
