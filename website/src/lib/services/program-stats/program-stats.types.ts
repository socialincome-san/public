import { Currency, PayoutStatus, SurveyStatus } from '@/generated/prisma/client';

export type ProgramDashboardStats = {
	contributedToProgramSoFarChf: number;
	totalProgramCostsChf: number;
	contributionsCount: number;
	contributorsCount: number;
	averageContributionChf: number;
	fundingProgressPercent: number;

	paidOutSoFarChf: number;
	totalPayoutsCount: number;
	payoutPerInterval: number;
	payoutInterval: string;
	payoutCurrency: Currency;
	costPerIntervalChf: number;
	payoutProgressPercent: number;

	availableCreditsChf: number;
	availableCreditsInIntervals: number;
	totalExpectedIntervals: number;

	completedSurveysCount: number;
	totalSurveysCount: number;
	surveyCompletionPercent: number;

	firstPayoutDate: Date | null;
	programEndDate: Date | null;
	lifecycleProgressPercent: number;

	programDurationInMonths: number;
	recipientsCount: number;
};

export type ProgramForDashboard = {
	programDurationInMonths: number;
	payoutPerInterval: unknown;
	payoutCurrency: Currency;
	payoutInterval: string;

	recipients: Array<{
		id: string;
		payouts: Array<{
			paymentAt: Date;
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
