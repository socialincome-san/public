import { Cause, PayoutInterval, ProgramPermission } from '@prisma/client';

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
	amountOfRecipientsForStart?: number | null;
	programDurationInMonths: number;
	payoutPerInterval: number;
	payoutCurrency: string;
	payoutInterval: PayoutInterval;
	targetCauses: Cause[];
};
