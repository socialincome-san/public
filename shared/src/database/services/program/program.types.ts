import { PayoutInterval, Program as PrismaProgram } from '@prisma/client';

export type CreateProgramInput = Omit<PrismaProgram, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramForecastShape = {
	totalPayments: number;
	payoutAmount: number;
	payoutCurrency: string;
	payoutInterval: PayoutInterval;
};
