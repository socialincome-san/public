import { Currency, PayoutInterval, PayoutStatus, SurveyStatus } from '@/generated/prisma/client';

export type ProgramDashboardStats = {
	contributedToProgramSoFarChf: number;
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

export type ProgramForDashboard = {
	programDurationInMonths: number;
	payoutPerInterval: unknown;
	payoutInterval: PayoutInterval;
	country: {
		currency: Currency;
	};

	recipients: Array<{
		id: string;
		startDate: Date | null;
		suspendedAt: Date | null;
		payouts: Array<{
			paymentAt: Date;
			amount: unknown;
			amountChf: unknown | null;
			status: PayoutStatus;
		}>;
		surveys: Array<{
			id: string;
			status: SurveyStatus;
		}>;
	}>;

	campaigns: Array<{
		contributions: Array<{
			amountChf: unknown;
			contributorId: string;
		}>;
	}>;
};

export type ProgramBudgetCalculationInput = {
	amountOfRecipients: number;
	programDuration: number;
	defaultPayoutPerInterval: number;
	payoutPerInterval: number;
	payoutInterval: PayoutInterval;
	payoutCurrency: Currency;
	displayCurrency: Currency;
};

export type ProgramBudgetCalculation = {
	calculatedTotalBudget: number;
	displayMonthlyCost: number;
	exchangeRateText?: string;
	totalBudgetTooltipText: string;
	payoutPerIntervalMin: number;
	payoutPerIntervalMax: number;
};
