import { Currency, PaymentEventType, PayoutInterval, PayoutStatus, SurveyStatus } from '@/generated/prisma/client';

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

export type ProgramForDashboard = {
	coveredByReserves: boolean;
	programDurationInMonths: number;
	payoutPerInterval: unknown;
	payoutInterval: PayoutInterval;
	country: {
		currency: Currency;
	};

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
		surveys: {
			id: string;
			status: SurveyStatus;
		}[];
	}[];

	campaigns: {
		contributions: {
			amountChf: unknown;
			contributorId: string;
			paymentEvent: {
				type: PaymentEventType;
			} | null;
		}[];
	}[];
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
