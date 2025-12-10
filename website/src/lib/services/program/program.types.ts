import { ProgramPermission } from '@prisma/client';

export type ProgramWallet = {
	id: string;
	programName: string;
	country: string;
	payoutCurrency: string;
	recipientsCount: number;
	totalPayoutsSum: number;
	permission: ProgramPermission;
};

export type ProgramWallets = {
	wallets: ProgramWallet[];
};

export type ProgramOption = {
	id: string;
	name: string;
};
