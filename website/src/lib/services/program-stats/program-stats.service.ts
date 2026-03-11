import {
	ContributionStatus,
	Currency,
	PaymentEventType,
	PayoutStatus,
	PrismaClient,
	SurveyStatus,
} from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { now } from '@/lib/utils/now';
import { slugify } from '@/lib/utils/string-utils';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import {
	ProgramBudgetCalculation,
	ProgramBudgetCalculationInput,
	ProgramDashboardStats,
	ProgramForDashboard,
} from './program-stats.types';

export class ProgramStatsService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly exchangeRateService: ExchangeRateReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	async isReadyForFirstPayoutInterval(programId: string): Promise<ServiceResult<boolean>> {
		try {
			const program = await this.loadProgram(programId);
			if (!program) {
				return this.resultFail('Program not found');
			}

			const nowDate = now();
			const expectedIntervals = this.getExpectedIntervals(program.programDurationInMonths, program.payoutInterval);
			const cohorts = this.splitRecipientCohorts(program, nowDate, expectedIntervals);
			if (cohorts.activeRecipientsCount === 0) {
				return this.resultOk(false);
			}

			const payoutPerInterval = Number(program.payoutPerInterval);
			const costPerIntervalProgramCurrency = this.calculateCostPerInterval(cohorts.activeRecipientsCount, payoutPerInterval);
			const rates = await this.getLatestRatesOrUndefined();
			const costPerIntervalChf =
				this.convertCurrencyAmount(costPerIntervalProgramCurrency, program.country.currency, 'CHF', rates) ??
				costPerIntervalProgramCurrency;

			let totalContributionsChf = 0;
			for (const campaign of program.campaigns) {
				for (const contribution of campaign.contributions) {
					totalContributionsChf += Number(contribution.amountChf);
				}
			}

			return this.resultOk(totalContributionsChf >= costPerIntervalChf);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not check program readiness: ${JSON.stringify(error)}`);
		}
	}

	async calculateProgramBudget(input: ProgramBudgetCalculationInput): Promise<ServiceResult<ProgramBudgetCalculation>> {
		try {
			const rates = await this.getLatestRatesOrUndefined();
			const calculation = this.calculateProgramBudgetWithRates(input, rates);
			return this.resultOk(calculation);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not calculate program budget preview: ${JSON.stringify(error)}`);
		}
	}

	async getProgramDashboardStats(programId: string): Promise<ServiceResult<ProgramDashboardStats>> {
		try {
			const program = await this.loadProgram(programId);
			if (!program) {
				return this.resultFail('Program not found');
			}

			const nowDate = now();
			const recipientsCount = program.recipients.length;
			const payoutPerInterval = Number(program.payoutPerInterval);
			const totalExpectedIntervals = this.getExpectedIntervals(program.programDurationInMonths, program.payoutInterval);
			const cohorts = this.splitRecipientCohorts(program, nowDate, totalExpectedIntervals);

			const rates = await this.getLatestRatesOrUndefined();

			const costPerIntervalProgramCurrency = this.calculateCostPerInterval(cohorts.activeRecipientsCount, payoutPerInterval);
			const costPerIntervalChf =
				this.convertCurrencyAmount(costPerIntervalProgramCurrency, program.country.currency, 'CHF', rates) ??
				costPerIntervalProgramCurrency;
			const payoutProgressExchangeRateText = this.getExchangeRateText('CHF', program.country.currency, rates);

			const payouts = this.computePayouts(program);
			const projection = this.computeProjectedRemaining({
				recipients: program.recipients,
				expectedIntervals: totalExpectedIntervals,
				nowDate,
				payoutPerInterval,
			});
			const projectedRemainingProgramCurrency = projection.projectedRemainingProgramCurrency;
			const projectedRemainingChf =
				this.convertCurrencyAmount(projectedRemainingProgramCurrency, program.country.currency, 'CHF', rates) ??
				projectedRemainingProgramCurrency;

			const totalProgramCostsProgramCurrency = payouts.paidOutSoFarProgramCurrency + projectedRemainingProgramCurrency;
			const totalProgramCostsChf = payouts.paidOutSoFarChf + projectedRemainingChf;
			const payoutProgressPercent =
				totalProgramCostsProgramCurrency > 0
					? (payouts.paidOutSoFarProgramCurrency / totalProgramCostsProgramCurrency) * 100
					: 0;

			const contributions = this.computeContributions(program, totalProgramCostsChf);
			const credits = this.computeAvailableCredits(
				contributions.contributedToProgramSoFarChf,
				payouts.paidOutSoFarChf,
				costPerIntervalChf,
				totalExpectedIntervals,
			);
			const availableCreditsProgramCurrency =
				this.convertCurrencyAmount(credits.availableCreditsChf, 'CHF', program.country.currency, rates) ??
				credits.availableCreditsChf;
			const surveys = this.computeSurveys(program);

			return this.resultOk({
				contributedToProgramSoFarChf: contributions.contributedToProgramSoFarChf,
				contributedViaStripeChf: contributions.contributedViaStripeChf,
				contributedViaWireTransferChf: contributions.contributedViaWireTransferChf,
				contributedViaOthersChf: contributions.contributedViaOthersChf,
				totalProgramCostsChf,
				contributionsCount: contributions.contributionsCount,
				contributorsCount: contributions.contributorsCount,
				averageContributionChf: contributions.averageContributionChf,
				fundingProgressPercent: contributions.fundingProgressPercent,

				paidOutSoFarChf: payouts.paidOutSoFarChf,
				paidOutSoFarProgramCurrency: payouts.paidOutSoFarProgramCurrency,
				totalPayoutsCount: payouts.totalPayoutsCount,
				payoutsDoneCount: payouts.payoutsDoneCount,
				remainingPayoutsCount: projection.remainingPayoutsCount,
				remainingIntervalsCount: projection.remainingIntervalsCount,
				payoutPerInterval,
				payoutInterval: program.payoutInterval,
				payoutCurrency: program.country.currency,
				costPerIntervalChf,
				costPerIntervalProgramCurrency,
				payoutProgressPercent,
				payoutProgressExchangeRateText,
				totalProgramCostsProgramCurrency,

				availableCreditsChf: credits.availableCreditsChf,
				availableCreditsProgramCurrency,
				availableCreditsInIntervals: credits.availableCreditsInIntervals,
				totalExpectedIntervals,

				completedSurveysCount: surveys.completedSurveysCount,
				totalSurveysCount: surveys.totalSurveysCount,
				surveyCompletionPercent: surveys.surveyCompletionPercent,

				futureRecipientsCount: cohorts.futureRecipientsCount,
				activeRecipientsCount: cohorts.activeRecipientsCount,
				suspendedRecipientsCount: cohorts.suspendedRecipientsCount,
				completedRecipientsCount: cohorts.completedRecipientsCount,

				programDurationInMonths: program.programDurationInMonths,
				recipientsCount,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not load program dashboard stats: ${JSON.stringify(error)}`);
		}
	}

	async getProgramDashboardStatsBySlug(slug: string): Promise<ServiceResult<ProgramDashboardStats>> {
		try {
			const programs = await this.db.program.findMany({ select: { id: true, name: true } });
			const match = programs.find((p) => slugify(p.name) === slug);
			if (!match) {
				return this.resultFail('Program not found');
			}

			return this.getProgramDashboardStats(match.id);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not load dashboard stats by slug: ${JSON.stringify(error)}`);
		}
	}

	private async loadProgram(programId: string): Promise<ProgramForDashboard | null> {
		return this.db.program.findUnique({
			where: { id: programId },
			select: {
				id: true,
				name: true,
				programDurationInMonths: true,
				payoutPerInterval: true,
				country: {
					select: {
						currency: true,
					},
				},
				payoutInterval: true,
				recipients: {
					select: {
						id: true,
						startDate: true,
						suspendedAt: true,
						payouts: {
							select: {
								paymentAt: true,
								amount: true,
								amountChf: true,
								status: true,
							},
						},
						surveys: {
							select: {
								id: true,
								status: true,
							},
						},
					},
				},
				campaigns: {
					select: {
						contributions: {
							where: { status: ContributionStatus.succeeded },
							select: {
								amountChf: true,
								contributorId: true,
								paymentEvent: {
									select: {
										type: true,
									},
								},
							},
						},
					},
				},
			},
		});
	}

	private computeContributions(program: ProgramForDashboard, totalProgramCostsChf: number) {
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
				if (contribution.paymentEvent?.type === PaymentEventType.stripe) {
					contributedViaStripeChf += amountChf;
				} else if (contribution.paymentEvent?.type === PaymentEventType.bank_transfer) {
					contributedViaWireTransferChf += amountChf;
				} else {
					contributedViaOthersChf += amountChf;
				}
				contributionsCount++;
				contributorIds.add(contribution.contributorId);
			}
		}

		const contributorsCount = contributorIds.size;
		const averageContributionChf = contributionsCount > 0 ? contributedToProgramSoFarChf / contributionsCount : 0;
		const fundingProgressPercent =
			totalProgramCostsChf > 0 ? (contributedToProgramSoFarChf / totalProgramCostsChf) * 100 : 0;

		return {
			contributedToProgramSoFarChf,
			contributedViaStripeChf,
			contributedViaWireTransferChf,
			contributedViaOthersChf,
			contributionsCount,
			contributorsCount,
			averageContributionChf,
			fundingProgressPercent,
		};
	}

	private computePayouts(program: ProgramForDashboard) {
		let paidOutSoFarChf = 0;
		let paidOutSoFarProgramCurrency = 0;
		let totalPayoutsCount = 0;
		let payoutsDoneCount = 0;

		for (const recipient of program.recipients) {
			const paidOrConfirmedCount = this.countPaidOrConfirmedPayouts(recipient.payouts);
			totalPayoutsCount += paidOrConfirmedCount;
			payoutsDoneCount += recipient.payouts.length;

			for (const payout of recipient.payouts) {
				if (payout.status === PayoutStatus.paid || payout.status === PayoutStatus.confirmed) {
					paidOutSoFarChf += Number(payout.amountChf ?? 0);
					paidOutSoFarProgramCurrency += Number(payout.amount ?? 0);
				}
			}
		}

		return {
			paidOutSoFarChf,
			paidOutSoFarProgramCurrency,
			totalPayoutsCount,
			payoutsDoneCount,
		};
	}

	private computeProjectedRemaining(params: {
		recipients: ProgramForDashboard['recipients'];
		expectedIntervals: number;
		nowDate: Date;
		payoutPerInterval: number;
	}): {
		projectedRemainingProgramCurrency: number;
		remainingPayoutsCount: number;
		remainingIntervalsCount: number;
	} {
		let projectedRemainingProgramCurrency = 0;
		let remainingPayoutsCount = 0;
		let remainingIntervalsCount = 0;

		for (const recipient of params.recipients) {
			const isSuspended = this.isRecipientSuspendedNow(recipient.suspendedAt, params.nowDate);
			const paidOrConfirmedCount = this.countPaidOrConfirmedPayouts(recipient.payouts);
			const isCompleted = this.isRecipientCompleted(paidOrConfirmedCount, params.expectedIntervals);

			if (isSuspended || isCompleted) {
				continue;
			}
			const remainingIntervals = Math.max(0, params.expectedIntervals - paidOrConfirmedCount);
			projectedRemainingProgramCurrency += remainingIntervals * params.payoutPerInterval;
			remainingPayoutsCount += remainingIntervals;
			remainingIntervalsCount = Math.max(remainingIntervalsCount, remainingIntervals);
		}

		return { projectedRemainingProgramCurrency, remainingPayoutsCount, remainingIntervalsCount };
	}

	private computeAvailableCredits(
		contributedToProgramSoFarChf: number,
		paidOutSoFarChf: number,
		costPerIntervalChf: number,
		totalExpectedIntervals: number,
	) {
		const availableCreditsChf = contributedToProgramSoFarChf - paidOutSoFarChf;
		const availableCreditsInIntervals = costPerIntervalChf > 0 ? availableCreditsChf / costPerIntervalChf : 0;
		return { availableCreditsChf, availableCreditsInIntervals, totalExpectedIntervals };
	}

	private computeSurveys(program: ProgramForDashboard) {
		let completedSurveysCount = 0;
		let totalSurveysCount = 0;

		for (const recipient of program.recipients) {
			totalSurveysCount += recipient.surveys.length;
			for (const survey of recipient.surveys) {
				if (survey.status === SurveyStatus.completed) {
					completedSurveysCount++;
				}
			}
		}

		const surveyCompletionPercent = totalSurveysCount > 0 ? (completedSurveysCount / totalSurveysCount) * 100 : 0;
		return { completedSurveysCount, totalSurveysCount, surveyCompletionPercent };
	}

	isRecipientEligibleForPayout(params: {
		startDate: Date | null;
		suspendedAt: Date | null;
		paidOrConfirmedCount: number;
		programDurationInMonths: number;
		payoutInterval: string;
		nowDate: Date;
	}): ServiceResult<boolean> {
		const hasStarted = this.isRecipientStartedNow(params.startDate, params.nowDate);
		if (!hasStarted) {
			return this.resultOk(false);
		}

		if (this.isRecipientSuspendedNow(params.suspendedAt, params.nowDate)) {
			return this.resultOk(false);
		}

		const expectedIntervals = this.getExpectedIntervals(params.programDurationInMonths, params.payoutInterval);
		return this.resultOk(!this.isRecipientCompleted(params.paidOrConfirmedCount, expectedIntervals));
	}

	private async getLatestRatesOrUndefined(): Promise<Partial<Record<Currency, number>> | undefined> {
		const latestRatesResult = await this.exchangeRateService.getLatestRates();
		return latestRatesResult.success ? latestRatesResult.data : undefined;
	}

	private getNumberOfIntervals(programDurationInMonths: number, interval: string): number {
		if (interval === 'quarterly') {
			return Math.ceil(programDurationInMonths / 3);
		}
		if (interval === 'yearly') {
			return Math.ceil(programDurationInMonths / 12);
		}
		return programDurationInMonths;
	}

	private getExpectedIntervals(programDurationInMonths: number, interval: string): number {
		return this.getNumberOfIntervals(programDurationInMonths, interval);
	}

	private calculateCostPerInterval(activeRecipientsCount: number, payoutPerInterval: number): number {
		return activeRecipientsCount * payoutPerInterval;
	}

	private countPaidOrConfirmedPayouts(payouts: { status: PayoutStatus }[]): number {
		return payouts.filter((p) => p.status === PayoutStatus.paid || p.status === PayoutStatus.confirmed).length;
	}

	private calculateTotalBudget(
		recipients: number,
		durationMonths: number,
		payoutPerInterval: number,
		interval: string,
	): number {
		const numberOfIntervals = this.getNumberOfIntervals(durationMonths, interval);
		return recipients * payoutPerInterval * numberOfIntervals;
	}

	private calculateMonthlyCost(recipients: number, payoutPerInterval: number, interval: string): number {
		if (interval === 'quarterly') {
			return (recipients * payoutPerInterval) / 3;
		}
		if (interval === 'yearly') {
			return (recipients * payoutPerInterval) / 12;
		}
		return recipients * payoutPerInterval;
	}

	private convertCurrencyAmount(
		amount: number,
		fromCurrency: Currency,
		toCurrency: Currency,
		rates?: Partial<Record<Currency, number>>,
	): number | undefined {
		if (fromCurrency === toCurrency) {
			return amount;
		}
		if (!rates) {
			return undefined;
		}
		const fromRate = rates[fromCurrency];
		const toRate = rates[toCurrency];
		if (!fromRate || !toRate) {
			return undefined;
		}
		return amount * (toRate / fromRate);
	}

	private getExchangeRateText(
		fromCurrency: Currency,
		toCurrency: Currency,
		rates?: Partial<Record<Currency, number>>,
	): string | undefined {
		const converted = this.convertCurrencyAmount(1, fromCurrency, toCurrency, rates);
		if (converted === undefined) {
			return undefined;
		}
		return `1 ${fromCurrency} = ${Number(converted.toFixed(4))} ${toCurrency}`;
	}

	private calculateProgramBudgetWithRates(
		input: ProgramBudgetCalculationInput,
		rates?: Partial<Record<Currency, number>>,
	): ProgramBudgetCalculation {
		const totalBudget = this.calculateTotalBudget(
			input.amountOfRecipients,
			input.programDuration,
			input.payoutPerInterval,
			input.payoutInterval,
		);
		const monthlyCost = this.calculateMonthlyCost(input.amountOfRecipients, input.payoutPerInterval, input.payoutInterval);
		const numberOfIntervals = this.getNumberOfIntervals(input.programDuration, input.payoutInterval);

		let calculatedTotalBudget = totalBudget;
		let displayMonthlyCost = monthlyCost;
		let exchangeRateText: string | undefined = `1 ${input.payoutCurrency} = 1 ${input.displayCurrency}`;

		if (input.displayCurrency !== input.payoutCurrency) {
			const convertedTotal = this.convertCurrencyAmount(totalBudget, input.payoutCurrency, input.displayCurrency, rates);
			const convertedMonthly = this.convertCurrencyAmount(monthlyCost, input.payoutCurrency, input.displayCurrency, rates);
			exchangeRateText = this.getExchangeRateText(input.payoutCurrency, input.displayCurrency, rates);
			if (convertedTotal !== undefined && convertedMonthly !== undefined && exchangeRateText) {
				calculatedTotalBudget = convertedTotal;
				displayMonthlyCost = convertedMonthly;
			}
		}

		const payoutPerIntervalMin = Math.max(1, Math.floor(input.defaultPayoutPerInterval / 2));
		const payoutPerIntervalMax = Math.max(payoutPerIntervalMin + 1, Math.ceil(input.defaultPayoutPerInterval * 2));
		const intervalLabel =
			input.payoutInterval === 'quarterly'
				? 'quarterly intervals'
				: input.payoutInterval === 'yearly'
					? 'yearly intervals'
					: 'monthly intervals';

		let totalBudgetTooltipText =
			`${input.amountOfRecipients.toLocaleString('de-CH')} recipients x ` +
			`${input.payoutPerInterval.toLocaleString('de-CH')} ${input.payoutCurrency} payout per interval x ` +
			`${numberOfIntervals.toLocaleString('de-CH')} ${intervalLabel} = ` +
			`${totalBudget.toLocaleString('de-CH')} ${input.payoutCurrency}`;

		if (input.displayCurrency !== input.payoutCurrency && exchangeRateText) {
			const factor = this.convertCurrencyAmount(1, input.payoutCurrency, input.displayCurrency, rates);
			totalBudgetTooltipText +=
				` | Currency conversion: ${totalBudget.toLocaleString('de-CH')} ${input.payoutCurrency} x ` +
				`${Number((factor ?? 1).toFixed(4))} = ${calculatedTotalBudget.toLocaleString('de-CH')} ${input.displayCurrency}`;
		}

		return {
			calculatedTotalBudget,
			displayMonthlyCost,
			exchangeRateText,
			totalBudgetTooltipText,
			payoutPerIntervalMin,
			payoutPerIntervalMax,
		};
	}

	private splitRecipientCohorts(program: ProgramForDashboard, nowDate: Date, expectedIntervals: number) {
		let futureRecipientsCount = 0;
		let activeRecipientsCount = 0;
		let suspendedRecipientsCount = 0;
		let completedRecipientsCount = 0;

		for (const recipient of program.recipients) {
			const hasStarted = this.isRecipientStartedNow(recipient.startDate, nowDate);
			const isFuture = !hasStarted;
			const isSuspended = this.isRecipientSuspendedNow(recipient.suspendedAt, nowDate);
			const paidOrConfirmedCount = this.countPaidOrConfirmedPayouts(recipient.payouts);
			const isCompleted = this.isRecipientCompleted(paidOrConfirmedCount, expectedIntervals);

			if (isFuture) {
				futureRecipientsCount++;
				continue;
			}
			if (isCompleted) {
				completedRecipientsCount++;
				continue;
			}
			if (isSuspended) {
				suspendedRecipientsCount++;
				continue;
			}
			if (hasStarted) {
				activeRecipientsCount++;
			}
		}

		return {
			futureRecipientsCount,
			activeRecipientsCount,
			suspendedRecipientsCount,
			completedRecipientsCount,
		};
	}

	private isRecipientStartedNow(startDate: Date | null, nowDate: Date): boolean {
		return startDate !== null && startDate < nowDate;
	}

	private isRecipientSuspendedNow(suspendedAt: Date | null, nowDate: Date): boolean {
		return suspendedAt !== null && suspendedAt <= nowDate;
	}

	private isRecipientCompleted(paidOrConfirmedCount: number, expectedIntervals: number): boolean {
		return paidOrConfirmedCount >= expectedIntervals;
	}
}
