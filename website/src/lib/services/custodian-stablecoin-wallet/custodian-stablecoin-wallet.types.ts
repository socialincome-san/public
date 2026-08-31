import { type Currency } from '@/generated/prisma/client';

export type CustodianStablecoinWalletBalance = {
	address: string;
	amount: number;
	currency: Currency;
};
