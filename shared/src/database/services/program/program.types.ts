import { ProgramPermission } from '@prisma/client';

export type ProgramWallet = {
	id: string;
	programName: string;
	country: string | null;
	payoutCurrency: string | null;
	recipientsCount: number;
	totalPayoutsSum: number;
	permission: ProgramPermission;
};

export type ProgramWalletView = {
	wallets: ProgramWallet[];
};

export type ProgramOption = {
	id: string;
	name: string;
};
