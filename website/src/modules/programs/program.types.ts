import type {
	CountryCode,
	Currency,
	PaymentEventType,
	PayoutInterval,
	PayoutStatus,
	Profile,
	ProgramPermission,
	SurveyStatus,
} from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

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

export type ProgramPayoutForecastSource = {
	programDurationInMonths: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	country: { currency: Currency };
	recipients: {
		startDate: Date | null;
		suspendedAt: Date | null;
		payouts: { id: string }[];
	}[];
};

export type PublicProgramDetails = {
	programId: string;
	programName: string;
	countryIsoCode: string;
	ownerOrganizationName: string | null;
	localPartnerName: string | null;
	localPartnerSlug: string | null;
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

type PublicProgramFilterFocus = {
	id: string;
	slug: string;
};

type PublicProgramFilterData = {
	programId: string;
	countryIsoCode: CountryCode;
	focuses: PublicProgramFilterFocus[];
};

export type PublicProgramFilterDataMap = Record<string, PublicProgramFilterData>;

export type PublicProgramTargetFocus = {
	id: string;
	slug: string;
	name: string;
};

export type PublicProgramStats = {
	campaignsCount: number;
	recipientsCount: number;
	countryIsoCode: CountryCode;
	payoutCurrency: Currency;
	totalPayoutsSum: number;
	totalPayoutsSumChf: number;
};

export type PublicProgramStatsMap = Record<string, PublicProgramStats>;

export type ProgramSettingsPayload = {
	id: string;
	name: string;
	slug: string;
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

export type ProgramFinancesDisplayAmounts = {
	currency: Currency;
	paidOutSoFar: number;
	totalProgramCosts: number;
	availableCredits: number;
};

export type ProgramDashboardStats = {
	contributedToProgramSoFarChf: number;
	contributedViaStripeChf: number;
	contributedViaWireTransferChf: number;
	contributedViaOthersChf: number;
	totalProgramCostsChf: number;
	contributionsCount: number;
	contributorsCount: number;
	averageContributionChf: number;
	fundingProgressPercent: number;
	paidOutSoFarChf: number;
	paidOutSoFarProgramCurrency: number;
	totalPayoutsCount: number;
	payoutsDoneCount: number;
	remainingPayoutsCount: number;
	remainingIntervalsCount: number;
	payoutPerInterval: number;
	payoutInterval: string;
	payoutCurrency: Currency;
	costPerIntervalChf: number;
	costPerIntervalProgramCurrency: number;
	payoutProgressPercent: number;
	payoutProgressExchangeRateText?: string;
	totalProgramCostsProgramCurrency: number;
	availableCreditsChf: number;
	availableCreditsProgramCurrency: number;
	availableCreditsInIntervals: number;
	totalExpectedIntervals: number;
	completedSurveysCount: number;
	totalSurveysCount: number;
	surveyCompletionPercent: number;
	futureRecipientsCount: number;
	activeRecipientsCount: number;
	suspendedRecipientsCount: number;
	completedRecipientsCount: number;
	programDurationInMonths: number;
	recipientsCount: number;
};

export type ProgramDashboardSource = {
	coveredByReserves: boolean;
	programDurationInMonths: number;
	payoutPerInterval: unknown;
	payoutInterval: PayoutInterval;
	country: { currency: Currency };
	recipients: {
		id: string;
		startDate: Date | null;
		suspendedAt: Date | null;
		payouts: {
			paymentAt: Date;
			amount: unknown;
			amountChf: unknown;
			status: PayoutStatus;
		}[];
		surveys: { id: string; status: SurveyStatus }[];
	}[];
	campaigns: {
		contributions: {
			amountChf: unknown;
			contributorId: string;
			paymentEvent: { type: PaymentEventType } | null;
		}[];
	}[];
};

export type ProgramBudgetCalculation = {
	calculatedTotalBudget: number;
	displayMonthlyCost: number;
	exchangeRateText?: string;
	payoutToDisplayRate?: number;
	totalBudgetTooltipText: string;
	payoutPerIntervalMin: number;
	payoutPerIntervalMax: number;
};

export type PublicSubmissionProgramOption = {
	id: string;
	name: string;
	slug: string;
	countryId: string;
	countryIsoCode: CountryCode;
	recipientsCount: number;
	description: string | null;
	imageUrl: string | null;
	tags: string[];
};

export type ProgramStatsReadService = {
	isReadyForFirstPayoutInterval: (programId: string) => Promise<ServiceResult<boolean>>;
};
