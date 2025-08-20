import { PayoutInterval, Program as PrismaProgram } from '@prisma/client';

export type CreateProgramInput = Omit<PrismaProgram, 'id' | 'createdAt' | 'updatedAt'>;

export type ProgramPermission = 'operator' | 'viewer';

export type UserProgramSummary = {
	id: string;
	name: string;
	programPermission: ProgramPermission;
};

export type ProgramWithOrganizations = {
	id: string;
	name: string;
	operatorOrganization?: { users: Array<{ id: string }> };
	viewerOrganization?: { users: Array<{ id: string }> };
};

export type ProgramWithRecipientsForForecast = {
	totalPayments: number;
	payoutAmount: number;
	payoutCurrency: string;
	payoutInterval: PayoutInterval;
	recipients: Array<{ startDate: Date | null }>;
};
