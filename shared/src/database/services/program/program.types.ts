import { Program, ProgramPermission } from '@prisma/client';

export type CreateProgramInput = Omit<Program, 'id' | 'createdAt' | 'updatedAt'>;

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
