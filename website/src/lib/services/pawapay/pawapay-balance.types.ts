import { type Currency } from '@/generated/prisma/client';

export type PawaPayBalance = {
	country: string;
	provider: string;
	amount: number;
	currency: Currency;
};

export const pawaPayWalletKey = (country: string, provider: string): string =>
	provider ? `${country}:${provider}` : country;
