import { Currency, PayoutInterval, PayoutStatus, SurveyStatus } from '@/generated/prisma/enums';
import type { WebsiteCurrency } from '@/lib/i18n/utils';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { now } from '@/lib/utils/now';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import { recipientStatusService } from '@/modules/recipients/recipient.service';
import * as programRepository from './program.repository';
import type { ProgramBudgetCalculationInput, ProgramFinancesStatsInput } from './program.schemas';
import type {
	ProgramBudgetCalculation,
	ProgramDashboardSource,
	ProgramDashboardStats,
	ProgramFinancesDisplayAmounts,
} from './program.types';

type ExchangeRates = Partial<Record<Currency, number>>;
const { countPaidOrConfirmedPayouts, getExpectedIntervals, getRecipientLifecycleStatusFromExpectedIntervals } =
	recipientStatusService;

export const isReadyForFirstPayoutInterval = async (programId: string): Promise<ServiceResult<boolean>> => {
	try {
		const program = await programRepository.findProgramDashboardSource(programId);
		if (!program) {
			return resultFail('Program not found');
		}

		const expectedIntervalsResult = getExpectedIntervals(program.programDurationInMonths, program.payoutInterval);
		if (!expectedIntervalsResult.success) {
			return resultFail(expectedIntervalsResult.error);
		}
		const cohorts = splitRecipientCohorts(program, now(), expectedIntervalsResult.data);
		if (program.coveredByReserves) {
			return resultOk(true);
		}
		if (cohorts.activeRecipientsCount === 0) {
			return resultOk(false);
		}

		const costPerInterval = cohorts.activeRecipientsCount * Number(program.payoutPerInterval);
		const rates = await getLatestRatesOrUndefined();
		const costPerIntervalChf =
			convertAmount(costPerInterval, program.country.currency, Currency.CHF, rates) ?? costPerInterval;
		const contributionsChf = program.campaigns.reduce(
			(campaignTotal, campaign) =>
				campaignTotal +
				campaign.contributions.reduce(
					(contributionTotal, contribution) => contributionTotal + Number(contribution.amountChf),
					0,
				),
			0,
		);

		return resultOk(contributionsChf >= costPerIntervalChf);
	} catch (error) {
		console.error('Could not check program readiness', { programId, error });

		return resultFail('Could not check program readiness');
	}
};

export const calculateProgramBudget = async (
	input: ProgramBudgetCalculationInput,
): Promise<ServiceResult<ProgramBudgetCalculation>> => {
	try {
		return resultOk(calculateProgramBudgetWithRates(input, await getLatestRatesOrUndefined()));
	} catch (error) {
		console.error('Could not calculate program budget preview', { error });

		return resultFail('Could not calculate program budget preview');
	}
};

export const resolveProgramFinancesDisplayAmounts = async (
	stats: ProgramFinancesStatsInput,
	displayCurrency: WebsiteCurrency,
): Promise<ServiceResult<ProgramFinancesDisplayAmounts>> => {
	if (displayCurrency === stats.payoutCurrency) {
		return resultOk(toPayoutCurrencyAmounts(stats));
	}
	if (displayCurrency === Currency.CHF) {
		return resultOk(toChfAmounts(stats));
	}

	try {
		const rates = await getLatestRatesOrUndefined();
		const paidOutSoFar = convertAmount(stats.paidOutSoFarChf, Currency.CHF, displayCurrency, rates);
		const totalProgramCosts = convertAmount(stats.totalProgramCostsChf, Currency.CHF, displayCurrency, rates);
		const availableCredits = convertAmount(stats.availableCreditsChf, Currency.CHF, displayCurrency, rates);
		if (paidOutSoFar === undefined || totalProgramCosts === undefined || availableCredits === undefined) {
			return resultOk(toPayoutCurrencyAmounts(stats));
		}

		return resultOk({ currency: displayCurrency, paidOutSoFar, totalProgramCosts, availableCredits });
	} catch (error) {
		console.error('Could not resolve program finance display amounts', { error });

		return resultFail('Could not resolve program finance display amounts');
	}
};

export const getProgramDashboardStats = async (programId: string): Promise<ServiceResult<ProgramDashboardStats>> => {
	try {
		const program = await programRepository.findProgramDashboardSource(programId);
		if (!program) {
			return resultFail('Program not found');
		}

		const nowDate = now();
		const payoutPerInterval = Number(program.payoutPerInterval);
		const totalExpectedIntervalsResult = getExpectedIntervals(program.programDurationInMonths, program.payoutInterval);
		if (!totalExpectedIntervalsResult.success) {
			return resultFail(totalExpectedIntervalsResult.error);
		}
		const totalExpectedIntervals = totalExpectedIntervalsResult.data;
		const cohorts = splitRecipientCohorts(program, nowDate, totalExpectedIntervals);
		const rates = await getLatestRatesOrUndefined();
		const costPerIntervalProgramCurrency = cohorts.activeRecipientsCount * payoutPerInterval;
		const costPerIntervalChf =
			convertAmount(costPerIntervalProgramCurrency, program.country.currency, Currency.CHF, rates) ??
			costPerIntervalProgramCurrency;
		const payouts = computePayouts(program);
		const projection = computeProjectedRemaining({
			recipients: program.recipients,
			expectedIntervals: totalExpectedIntervals,
			nowDate,
			payoutPerInterval,
		});
		const projectedRemainingChf =
			convertAmount(projection.projectedRemainingProgramCurrency, program.country.currency, Currency.CHF, rates) ??
			projection.projectedRemainingProgramCurrency;
		const totalProgramCostsProgramCurrency =
			payouts.paidOutSoFarProgramCurrency + projection.projectedRemainingProgramCurrency;
		const totalProgramCostsChf = payouts.paidOutSoFarChf + projectedRemainingChf;
		const contributions = computeContributions(program, totalProgramCostsChf);
		const availableCreditsChf = contributions.contributedToProgramSoFarChf - payouts.paidOutSoFarChf;
		const surveys = computeSurveys(program);

		return resultOk({
			...contributions,
			totalProgramCostsChf,
			...payouts,
			remainingPayoutsCount: projection.remainingPayoutsCount,
			remainingIntervalsCount: projection.remainingIntervalsCount,
			payoutPerInterval,
			payoutInterval: program.payoutInterval,
			payoutCurrency: program.country.currency,
			costPerIntervalChf,
			costPerIntervalProgramCurrency,
			payoutProgressPercent:
				totalProgramCostsProgramCurrency > 0
					? (payouts.paidOutSoFarProgramCurrency / totalProgramCostsProgramCurrency) * 100
					: 0,
			payoutProgressExchangeRateText: getExchangeRateText(Currency.CHF, program.country.currency, rates),
			totalProgramCostsProgramCurrency,
			availableCreditsChf,
			availableCreditsProgramCurrency:
				convertAmount(availableCreditsChf, Currency.CHF, program.country.currency, rates) ?? availableCreditsChf,
			availableCreditsInIntervals: costPerIntervalChf > 0 ? availableCreditsChf / costPerIntervalChf : 0,
			totalExpectedIntervals,
			...surveys,
			...cohorts,
			programDurationInMonths: program.programDurationInMonths,
			recipientsCount: program.recipients.length,
		});
	} catch (error) {
		console.error('Could not load program dashboard stats', { programId, error });

		return resultFail('Could not load program dashboard stats');
	}
};

const getLatestRatesOrUndefined = async (): Promise<ExchangeRates | undefined> => {
	const ratesResult = await getLatestRates();

	return ratesResult.success ? ratesResult.data : undefined;
};

const convertAmount = (
	amount: number,
	fromCurrency: Currency,
	toCurrency: Currency,
	rates?: ExchangeRates,
): number | undefined => {
	if (fromCurrency === toCurrency) {
		return amount;
	}
	const fromRate = rates?.[fromCurrency];
	const toRate = rates?.[toCurrency];
	if (
		fromRate === undefined ||
		toRate === undefined ||
		!Number.isFinite(fromRate) ||
		!Number.isFinite(toRate) ||
		fromRate <= 0 ||
		toRate <= 0
	) {
		return undefined;
	}

	return amount * (toRate / fromRate);
};

const toChfAmounts = (stats: ProgramFinancesStatsInput): ProgramFinancesDisplayAmounts => ({
	currency: Currency.CHF,
	paidOutSoFar: stats.paidOutSoFarChf,
	totalProgramCosts: stats.totalProgramCostsChf,
	availableCredits: stats.availableCreditsChf,
});

const toPayoutCurrencyAmounts = (stats: ProgramFinancesStatsInput): ProgramFinancesDisplayAmounts => ({
	currency: stats.payoutCurrency,
	paidOutSoFar: stats.paidOutSoFarProgramCurrency,
	totalProgramCosts: stats.totalProgramCostsProgramCurrency,
	availableCredits: stats.availableCreditsProgramCurrency,
});

const computeContributions = (program: ProgramDashboardSource, totalProgramCostsChf: number) => {
	let contributedToProgramSoFarChf = 0;
	let contributedViaStripeChf = 0;
	let contributedViaWireTransferChf = 0;
	let contributedViaOthersChf = 0;
	let contributionsCount = 0;
	const contributorIds = new Set<string>();

	for (const campaign of program.campaigns) {
		for (const contribution of campaign.contributions) {
			const amountChf = Number(contribution.amountChf);
			contributedToProgramSoFarChf += amountChf;
			if (contribution.paymentEvent?.type === 'stripe') {
				contributedViaStripeChf += amountChf;
			} else if (contribution.paymentEvent?.type === 'bank_transfer') {
				contributedViaWireTransferChf += amountChf;
			} else {
				contributedViaOthersChf += amountChf;
			}
			contributionsCount++;
			contributorIds.add(contribution.contributorId);
		}
	}

	return {
		contributedToProgramSoFarChf,
		contributedViaStripeChf,
		contributedViaWireTransferChf,
		contributedViaOthersChf,
		contributionsCount,
		contributorsCount: contributorIds.size,
		averageContributionChf: contributionsCount > 0 ? contributedToProgramSoFarChf / contributionsCount : 0,
		fundingProgressPercent: totalProgramCostsChf > 0 ? (contributedToProgramSoFarChf / totalProgramCostsChf) * 100 : 0,
	};
};

const computePayouts = (program: ProgramDashboardSource) => {
	let paidOutSoFarChf = 0;
	let paidOutSoFarProgramCurrency = 0;
	let totalPayoutsCount = 0;
	let payoutsDoneCount = 0;

	for (const recipient of program.recipients) {
		const paidCountResult = countPaidOrConfirmedPayouts(recipient.payouts);
		totalPayoutsCount += paidCountResult.success ? paidCountResult.data : 0;
		payoutsDoneCount += recipient.payouts.length;
		for (const payout of recipient.payouts) {
			if (payout.status === PayoutStatus.paid || payout.status === PayoutStatus.confirmed) {
				paidOutSoFarChf += Number(payout.amountChf ?? 0);
				paidOutSoFarProgramCurrency += Number(payout.amount ?? 0);
			}
		}
	}

	return { paidOutSoFarChf, paidOutSoFarProgramCurrency, totalPayoutsCount, payoutsDoneCount };
};

const computeProjectedRemaining = (input: {
	recipients: ProgramDashboardSource['recipients'];
	expectedIntervals: number;
	nowDate: Date;
	payoutPerInterval: number;
}) => {
	let projectedRemainingProgramCurrency = 0;
	let remainingPayoutsCount = 0;
	let remainingIntervalsCount = 0;

	for (const recipient of input.recipients) {
		const paidCountResult = countPaidOrConfirmedPayouts(recipient.payouts);
		const paidOrConfirmedCount = paidCountResult.success ? paidCountResult.data : 0;
		const statusResult = getRecipientLifecycleStatusFromExpectedIntervals({
			startDate: recipient.startDate,
			suspendedAt: recipient.suspendedAt,
			paidOrConfirmedCount,
			expectedIntervals: input.expectedIntervals,
			nowDate: input.nowDate,
		});
		const status = statusResult.success ? statusResult.data : 'future';
		if (status === 'suspended' || status === 'completed') {
			continue;
		}
		const remainingIntervals = Math.max(0, input.expectedIntervals - paidOrConfirmedCount);
		projectedRemainingProgramCurrency += remainingIntervals * input.payoutPerInterval;
		remainingPayoutsCount += remainingIntervals;
		remainingIntervalsCount = Math.max(remainingIntervalsCount, remainingIntervals);
	}

	return { projectedRemainingProgramCurrency, remainingPayoutsCount, remainingIntervalsCount };
};

const computeSurveys = (program: ProgramDashboardSource) => {
	let completedSurveysCount = 0;
	let totalSurveysCount = 0;
	for (const recipient of program.recipients) {
		totalSurveysCount += recipient.surveys.length;
		completedSurveysCount += recipient.surveys.filter(({ status }) => status === SurveyStatus.completed).length;
	}

	return {
		completedSurveysCount,
		totalSurveysCount,
		surveyCompletionPercent: totalSurveysCount > 0 ? (completedSurveysCount / totalSurveysCount) * 100 : 0,
	};
};

const getNumberOfIntervals = (durationMonths: number, interval: PayoutInterval): number => {
	if (interval === PayoutInterval.quarterly) {
		return Math.ceil(durationMonths / 3);
	}
	if (interval === PayoutInterval.yearly) {
		return Math.ceil(durationMonths / 12);
	}

	return durationMonths;
};

const calculateProgramBudgetWithRates = (
	input: ProgramBudgetCalculationInput,
	rates?: ExchangeRates,
): ProgramBudgetCalculation => {
	const numberOfIntervals = getNumberOfIntervals(input.programDuration, input.payoutInterval);
	const totalBudget = input.amountOfRecipients * input.payoutPerInterval * numberOfIntervals;
	const monthlyDivisor =
		input.payoutInterval === PayoutInterval.quarterly ? 3 : input.payoutInterval === PayoutInterval.yearly ? 12 : 1;
	const monthlyCost = (input.amountOfRecipients * input.payoutPerInterval) / monthlyDivisor;
	let calculatedTotalBudget = totalBudget;
	let displayMonthlyCost = monthlyCost;
	let payoutToDisplayRate: number | undefined;

	if (input.displayCurrency !== input.payoutCurrency) {
		const convertedTotal = convertAmount(totalBudget, input.payoutCurrency, input.displayCurrency, rates);
		const convertedMonthly = convertAmount(monthlyCost, input.payoutCurrency, input.displayCurrency, rates);
		payoutToDisplayRate = convertAmount(1, input.payoutCurrency, input.displayCurrency, rates);
		if (convertedTotal !== undefined && convertedMonthly !== undefined && payoutToDisplayRate !== undefined) {
			calculatedTotalBudget = convertedTotal;
			displayMonthlyCost = convertedMonthly;
		}
	}

	const intervalLabel =
		input.payoutInterval === PayoutInterval.quarterly
			? 'quarterly intervals'
			: input.payoutInterval === PayoutInterval.yearly
				? 'yearly intervals'
				: 'monthly intervals';
	let totalBudgetTooltipText =
		`${input.amountOfRecipients.toLocaleString('de-CH')} recipients x ` +
		`${input.payoutPerInterval.toLocaleString('de-CH')} ${input.payoutCurrency} payout per interval x ` +
		`${numberOfIntervals.toLocaleString('de-CH')} ${intervalLabel} = ` +
		`${totalBudget.toLocaleString('de-CH')} ${input.payoutCurrency}`;
	if (payoutToDisplayRate !== undefined) {
		totalBudgetTooltipText +=
			` | Currency conversion: ${totalBudget.toLocaleString('de-CH')} ${input.payoutCurrency} x ` +
			`${Number(payoutToDisplayRate.toFixed(4))} = ${calculatedTotalBudget.toLocaleString('de-CH')} ${input.displayCurrency}`;
	}

	const payoutPerIntervalMin = Math.max(1, Math.floor(input.defaultPayoutPerInterval / 2));

	return {
		calculatedTotalBudget,
		displayMonthlyCost,
		exchangeRateText:
			payoutToDisplayRate === undefined
				? input.displayCurrency === input.payoutCurrency
					? `1 ${input.payoutCurrency} = 1 ${input.displayCurrency}`
					: undefined
				: `1 ${input.payoutCurrency} = ${Number(payoutToDisplayRate.toFixed(4))} ${input.displayCurrency}`,
		payoutToDisplayRate,
		totalBudgetTooltipText,
		payoutPerIntervalMin,
		payoutPerIntervalMax: Math.max(payoutPerIntervalMin + 1, Math.ceil(input.defaultPayoutPerInterval * 2)),
	};
};

const splitRecipientCohorts = (program: ProgramDashboardSource, nowDate: Date, expectedIntervals: number) => {
	let futureRecipientsCount = 0;
	let activeRecipientsCount = 0;
	let suspendedRecipientsCount = 0;
	let completedRecipientsCount = 0;

	for (const recipient of program.recipients) {
		const paidCountResult = countPaidOrConfirmedPayouts(recipient.payouts);
		const statusResult = getRecipientLifecycleStatusFromExpectedIntervals({
			startDate: recipient.startDate,
			suspendedAt: recipient.suspendedAt,
			paidOrConfirmedCount: paidCountResult.success ? paidCountResult.data : 0,
			expectedIntervals,
			nowDate,
		});
		const status = statusResult.success ? statusResult.data : 'future';
		if (status === 'future') {
			futureRecipientsCount++;
		} else if (status === 'active') {
			activeRecipientsCount++;
		} else if (status === 'suspended') {
			suspendedRecipientsCount++;
		} else {
			completedRecipientsCount++;
		}
	}

	return { futureRecipientsCount, activeRecipientsCount, suspendedRecipientsCount, completedRecipientsCount };
};

const getExchangeRateText = (fromCurrency: Currency, toCurrency: Currency, rates?: ExchangeRates): string | undefined => {
	const converted = convertAmount(1, fromCurrency, toCurrency, rates);

	return converted === undefined ? undefined : `1 ${fromCurrency} = ${Number(converted.toFixed(4))} ${toCurrency}`;
};
