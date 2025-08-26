import { Program as PrismaProgram } from '@prisma/client';

export type CreateProgramInput = Omit<PrismaProgram, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramPermission = 'operator' | 'viewer';

export type ProgramWallet = {
	id: string;
	programName: string;
	country: string;
	payoutCurrency: string;
	recipientsCount: number;
	totalPayoutsSum: number;
	permission: ProgramPermission;
};

export type ProgramWalletView = {
	wallets: ProgramWallet[];
};
