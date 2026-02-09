import { Cause, CountryCode, PayoutInterval, ProgramPermission } from '@/generated/prisma/client';

export type ProgramWallet = {
	id: string;
	programName: string;
	country: CountryCode;
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
	amountOfRecipientsForStart: number;
	programDurationInMonths: number;
	payoutPerInterval: number;
	payoutCurrency: string;
	payoutInterval: PayoutInterval;
	targetCauses: Cause[];
};

export type PublicProgramDetails = {
	programId: string;
	programName: string;
	countryIsoCode: string;
	ownerOrganizationName: string | null;
	operatorOrganizationName: string | null;
	targetCauses: Cause[];
	amountOfRecipientsForStart: number | null;
	programDurationInMonths: number;
	payoutPerInterval: number;
	payoutCurrency: string;
	payoutInterval: PayoutInterval;
	recipientsCount: number;
	totalPayoutsCount: number;
	totalPayoutsSum: number;
	completedSurveysCount: number;
	startedAt: Date | null;
};
