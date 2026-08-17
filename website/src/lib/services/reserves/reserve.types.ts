import { type Currency } from '@/generated/prisma/client';

export type ReserveCreateInput = {
	bankAccountId: string;
	date: Date;
	amount: number;
	currency: Currency;
	amountChf: number;
};

export type BankAccountLatestReserve = {
	bankAccountId: string;
	bankAccountNumber: string | null;
	description: string | null;
	amountChf: number | null;
	recordedAt: Date | null;
};

export type LatestReserves = {
	accounts: BankAccountLatestReserve[];
	total: number;
};
