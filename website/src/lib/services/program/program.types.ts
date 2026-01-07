import { ProgramManagementType, RecipientApproachType } from '@/components/create-program-wizard/wizard/types';
import { Cause, ProgramPermission } from '@prisma/client';

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

export type CreateProgramInput = {
	countryId: string;
	programManagement: ProgramManagementType;
	recipientApproach: RecipientApproachType;
	budget: number;
	targetCauses: Cause[];
};
