import { ContributionStatus, PayoutStatus, SurveyStatus } from '@/generated/prisma/client';
import { now } from '@/lib/utils/now';
import { slugify } from '@/lib/utils/string-utils';
import { addMonths, differenceInMonths } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramDashboardStats, ProgramForDashboard } from './program-stats.types';

export class ProgramStatsService extends BaseService {
	async getProgramDashboardStats(programId: string): Promise<ServiceResult<ProgramDashboardStats>> {
		try {
			const program = await this.loadProgram(programId);
			if (!program) {
				return this.resultFail('Program not found');
			}

			const nowDate = now();
			const recipientsCount = program.recipients.length;
			const payoutPerInterval = Number(program.payoutPerInterval);
			const intervalInMonths = this.getIntervalInMonths(program.payoutInterval);
			const expectedPayoutsPerRecipient = Math.ceil(program.programDurationInMonths / intervalInMonths);

			const costPerIntervalChf = recipientsCount * payoutPerInterval;
			const totalProgramCostsChf = recipientsCount * payoutPerInterval * expectedPayoutsPerRecipient;

			const contributions = this.computeContributions(program, totalProgramCostsChf);
			const payouts = this.computePayouts(program, totalProgramCostsChf);
			const credits = this.computeAvailableCredits(
				contributions.contributedToProgramSoFarChf,
				payouts.paidOutSoFarChf,
				costPerIntervalChf,
				expectedPayoutsPerRecipient,
			);
			const surveys = this.computeSurveys(program);
			const lifecycle = this.computeLifecycle(payouts.firstPayoutDate, program.programDurationInMonths, nowDate);

			return this.resultOk({
				contributedToProgramSoFarChf: contributions.contributedToProgramSoFarChf,
				totalProgramCostsChf,
				contributionsCount: contributions.contributionsCount,
				contributorsCount: contributions.contributorsCount,
				averageContributionChf: contributions.averageContributionChf,
				fundingProgressPercent: contributions.fundingProgressPercent,

				paidOutSoFarChf: payouts.paidOutSoFarChf,
				totalPayoutsCount: payouts.totalPayoutsCount,
				payoutPerInterval,
				payoutInterval: program.payoutInterval,
				payoutCurrency: program.payoutCurrency,
				costPerIntervalChf,
				payoutProgressPercent: payouts.payoutProgressPercent,

				availableCreditsChf: credits.availableCreditsChf,
				availableCreditsInIntervals: credits.availableCreditsInIntervals,
				totalExpectedIntervals: credits.totalExpectedIntervals,

				completedSurveysCount: surveys.completedSurveysCount,
				totalSurveysCount: surveys.totalSurveysCount,
				surveyCompletionPercent: surveys.surveyCompletionPercent,

				firstPayoutDate: payouts.firstPayoutDate,
				programEndDate: lifecycle.programEndDate,
				lifecycleProgressPercent: lifecycle.lifecycleProgressPercent,

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
				payoutCurrency: true,
				payoutInterval: true,
				recipients: {
					select: {
						id: true,
						payouts: {
							select: {
								paymentAt: true,
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
							},
						},
					},
				},
			},
		});
	}

	private computeContributions(program: ProgramForDashboard, totalProgramCostsChf: number) {
		let contributedToProgramSoFarChf = 0;
		let contributionsCount = 0;
		const contributorIds = new Set<string>();

		for (const campaign of program.campaigns) {
			for (const contribution of campaign.contributions) {
				contributedToProgramSoFarChf += Number(contribution.amountChf);
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
			contributionsCount,
			contributorsCount,
			averageContributionChf,
			fundingProgressPercent,
		};
	}

	private computePayouts(program: ProgramForDashboard, totalProgramCostsChf: number) {
		let paidOutSoFarChf = 0;
		let totalPayoutsCount = 0;
		let firstPayoutDate: Date | null = null;

		for (const recipient of program.recipients) {
			for (const payout of recipient.payouts) {
				if (payout.status === PayoutStatus.paid || payout.status === PayoutStatus.confirmed) {
					totalPayoutsCount++;
					paidOutSoFarChf += Number(payout.amountChf ?? 0);

					if (!firstPayoutDate || payout.paymentAt < firstPayoutDate) {
						firstPayoutDate = payout.paymentAt;
					}
				}
			}
		}

		const payoutProgressPercent = totalProgramCostsChf > 0 ? (paidOutSoFarChf / totalProgramCostsChf) * 100 : 0;

		return { paidOutSoFarChf, totalPayoutsCount, firstPayoutDate, payoutProgressPercent };
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

	private computeLifecycle(firstPayoutDate: Date | null, programDurationInMonths: number, now: Date) {
		let programEndDate: Date | null = null;
		let lifecycleProgressPercent = 0;

		if (firstPayoutDate) {
			programEndDate = addMonths(firstPayoutDate, programDurationInMonths);
			const monthsPassed = differenceInMonths(now, firstPayoutDate);
			lifecycleProgressPercent = programDurationInMonths > 0 ? (monthsPassed / programDurationInMonths) * 100 : 0;
			if (lifecycleProgressPercent > 100) {
				lifecycleProgressPercent = 100;
			}
			if (lifecycleProgressPercent < 0) {
				lifecycleProgressPercent = 0;
			}
		}

		return { programEndDate, lifecycleProgressPercent };
	}

	private getIntervalInMonths(interval: string): number {
		if (interval === 'quarterly') {
			return 3;
		}
		if (interval === 'yearly') {
			return 12;
		}
		return 1;
	}
}
