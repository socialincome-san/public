import { CountryCode, Currency, PayoutInterval, Profile, ProgramPermission } from '@/generated/prisma/client';

export type ProgramWallet = {
	id: string;
	programName: string;
	country: CountryCode;
	payoutCurrency: Currency;
	recipientsCount: number;
	totalPayoutsSum: number;
	permission: ProgramPermission;
	isReadyForFirstPayouts: boolean;
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
	payoutInterval: PayoutInterval;
	targetFocuses: string[];
	targetProfiles: Profile[];
};

export type PublicOnboardingUserDetails = {
	email: string;
	firstName: string;
	lastName: string;
};

export type PublicProgramDetails = {
	programId: string;
	programName: string;
	countryIsoCode: string;
	ownerOrganizationName: string | null;
	operatorOrganizationName: string | null;
	targetFocuses: string[];
	amountOfRecipientsForStart: number | null;
	programDurationInMonths: number;
	payoutPerInterval: number;
	payoutCurrency: Currency;
	payoutInterval: PayoutInterval;
	recipientsCount: number;
	totalPayoutsCount: number;
	totalPayoutsSum: number;
	completedSurveysCount: number;
	startedAt: Date | null;
};

export type PublicPreviewProgram = {
	id: string;
	name: string;
};

export type PublicProgramStats = {
	campaignsCount: number;
	recipientsCount: number;
};

export type PublicProgramStatsMap = Record<string, PublicProgramStats>;

export type ProgramSettingsPayload = {
	id: string;
	name: string;
	countryId: string;
	country: {
		isoCode: CountryCode;
		currency: Currency;
	};
	amountOfRecipientsForStart: number | null;
	coveredByReserves: boolean;
	programDurationInMonths: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	targetFocuses: string[];
	targetProfiles: Profile[];
	ownerOrganizationIds: string[];
	operatorOrganizationIds: string[];
	createdAt: Date;
	updatedAt: Date | null;
	permission: ProgramPermission;
	canEdit: boolean;
};

export type ProgramSettingsUpdateInput = {
	id: string;
	name: string;
	countryId: string;
	coveredByReserves: boolean;
	programDurationInMonths: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	targetFocuses: string[];
	targetProfiles: Profile[];
	ownerOrganizationIds: string[];
	operatorOrganizationIds: string[];
};
