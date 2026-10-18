import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { formatCurrencyLocale, formatNumberLocale } from '@/lib/utils/string-utils';
import type { ProgramDashboardStats } from '@/modules/programs/program.types';
import { cn } from '@socialincome/design-system/cn';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { StatGrid } from '@socialincome/design-system/data-display/stat-grid/stat-grid';
import { StatHeadline } from '@socialincome/design-system/data-display/stat-headline/stat-headline';
import { StatPanel } from '@socialincome/design-system/data-display/stat-panel/stat-panel';
import { StatProgress } from '@socialincome/design-system/data-display/stat-progress/stat-progress';
import { Stat } from '@socialincome/design-system/data-display/stat/stat';
import { Tooltip, TooltipContent, TooltipTrigger } from '@socialincome/design-system/overlays/tool-tip/tool-tip';
import { AlertCircle, CheckCircle, TriangleAlert } from 'lucide-react';
import { SectionTitle } from './section-title';

type StatsSectionProps = {
	programId: string;
	stats: ProgramDashboardStats;
};

export const StatsSection = async ({ programId, stats }: StatsSectionProps) => {
	const t = await getPortalOperationsTranslations();
	const getCreditStatusLabel = (creditsInIntervals: number, totalExpected: number) => {
		if (creditsInIntervals < 1) {
			return t('program.stats.not_secured');
		}
		if (creditsInIntervals >= totalExpected) {
			return t('program.stats.fully_funded');
		}
		if (creditsInIntervals > 3) {
			return t('program.stats.healthy_credits');
		}
		if (creditsInIntervals >= 1) {
			return t('program.stats.low_credits');
		}

		return '';
	};

	const getCreditStatusExplanation = (creditsInIntervals: number, totalExpected: number) => {
		if (creditsInIntervals < 1) {
			return t('program.stats.credit_status_unsecured');
		}
		if (creditsInIntervals >= totalExpected) {
			return t('program.stats.credit_status_fully_funded');
		}
		if (creditsInIntervals > 3) {
			return t('program.stats.credit_status_healthy');
		}
		if (creditsInIntervals >= 1) {
			return t('program.stats.credit_status_low');
		}

		return '';
	};

	const getCreditIcon = (creditsInIntervals: number, totalExpected: number) => {
		if (creditsInIntervals < 1) {
			return { Icon: TriangleAlert, color: 'text-destructive' };
		}
		if (creditsInIntervals >= totalExpected) {
			return { Icon: CheckCircle, color: 'text-confirm' };
		}
		if (creditsInIntervals > 3) {
			return { Icon: CheckCircle, color: 'text-confirm' };
		}
		if (creditsInIntervals >= 1) {
			return { Icon: AlertCircle, color: 'text-warning' };
		}

		return { Icon: AlertCircle, color: 'text-muted-foreground' };
	};

	const { Icon, color } = getCreditIcon(stats.availableCreditsInIntervals, stats.totalExpectedIntervals);
	const creditStatus = getCreditStatusLabel(stats.availableCreditsInIntervals, stats.totalExpectedIntervals);
	const creditExplanation = getCreditStatusExplanation(stats.availableCreditsInIntervals, stats.totalExpectedIntervals);
	const projectedRemainingProgramCurrency = stats.totalProgramCostsProgramCurrency - stats.paidOutSoFarProgramCurrency;
	const formatMoney = (amount: number, currency: string) =>
		formatCurrencyLocale(amount, currency, 'de-CH', { compactThreshold: 1_000_000 });
	const formatNumber = (value: number, maximumFractionDigits = 0) =>
		formatNumberLocale(value, 'de-CH', { maximumFractionDigits, compactThreshold: 1_000_000 });
	const intervalsExplanation = t('program.stats.intervals_explanation');
	const totalContributionsExplanation = t('program.stats.total_contributions_explanation');
	const totalProgramCostChfExplanation = t('program.stats.total_program_cost_chf_explanation');
	const paidOutSoFarExplanation = t('program.stats.paid_out_explanation');
	const totalProgramCostProgramCurrencyExplanation = t('program.stats.total_program_cost_currency_explanation');
	const contributorsExplanation = t('program.stats.contributors_explanation');
	const contributionsExplanation = t('program.stats.contributions_explanation');
	const averageContributionExplanation = t('program.stats.average_contribution_explanation');
	const contributedViaStripeExplanation = t('program.stats.stripe_explanation');
	const contributedViaWireTransferExplanation = t('program.stats.wire_transfer_explanation');
	const contributedViaOthersExplanation = t('program.stats.other_contributions_explanation');
	const payoutPerIntervalExplanation = t('program.stats.payout_per_interval_explanation');
	const payoutIntervalExplanation = t('program.stats.payout_interval_explanation');
	const programDurationExplanation = t('program.stats.program_duration_explanation');
	const costPerIntervalProgramExplanation = t('program.stats.cost_per_interval_explanation');
	const projectedRemainingExplanation = t('program.stats.projected_remaining_explanation');
	const payoutsDoneExplanation = t('program.stats.payouts_done_explanation');
	const remainingPayoutsExplanation = t('program.stats.remaining_payouts_explanation');
	const availableCreditsExplanation = t('program.stats.available_credits_explanation');
	const creditStatusLabelExplanation = t('program.stats.credit_status_explanation');
	const remainingIntervalsExplanation = t('program.stats.remaining_intervals_explanation');
	const recipientsTotalExplanation = t('program.stats.recipients_total_explanation');
	const futureRecipientsExplanation = t('program.stats.future_recipients_explanation');
	const activeRecipientsExplanation = t('program.stats.active_recipients_explanation');
	const suspendedRecipientsExplanation = t('program.stats.suspended_recipients_explanation');
	const completedRecipientsExplanation = t('program.stats.completed_recipients_explanation');
	const completedSurveysExplanation = t('program.stats.completed_surveys_explanation');
	const totalSurveysExplanation = t('program.stats.total_surveys_explanation');

	return (
		<div className="space-y-4">
			<SectionTitle>{t('program.stats.title')}</SectionTitle>

			<Card>
				<div className="space-y-6">
					<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
						<StatPanel href="/portal/management/contributions">
							<StatProgress
								title={t('program.stats.contributions_progress')}
								start={{
									label: t('program.stats.total_contributions'),
									value: formatMoney(stats.contributedToProgramSoFarChf, 'CHF'),
									info: totalContributionsExplanation,
								}}
								end={{
									label: t('program.stats.total_program_cost'),
									value: formatMoney(stats.totalProgramCostsChf, 'CHF'),
									info: totalProgramCostChfExplanation,
								}}
								percent={stats.fundingProgressPercent}
							/>
							<StatGrid>
								<Stat
									label={t('program.stats.contributors')}
									value={formatNumber(stats.contributorsCount)}
									info={contributorsExplanation}
								/>
								<Stat
									label={t('program.stats.contributions')}
									value={formatNumber(stats.contributionsCount)}
									info={contributionsExplanation}
								/>
								<Stat
									label={t('program.stats.average_contribution')}
									value={formatMoney(stats.averageContributionChf, 'CHF')}
									info={averageContributionExplanation}
								/>
								<Stat
									label={t('program.stats.via_stripe')}
									value={formatMoney(stats.contributedViaStripeChf, 'CHF')}
									info={contributedViaStripeExplanation}
								/>
								<Stat
									label={t('program.stats.via_wire_transfer')}
									value={formatMoney(stats.contributedViaWireTransferChf, 'CHF')}
									info={contributedViaWireTransferExplanation}
								/>
								<Stat
									label={t('program.stats.others')}
									value={formatMoney(stats.contributedViaOthersChf, 'CHF')}
									info={contributedViaOthersExplanation}
								/>
							</StatGrid>
						</StatPanel>

						<StatPanel href="/portal/delivery/payouts">
							<StatProgress
								title={t('program.stats.payout_progress')}
								start={{
									label: t('program.stats.paid_out_so_far'),
									value: formatMoney(stats.paidOutSoFarProgramCurrency, stats.payoutCurrency),
									info: paidOutSoFarExplanation,
								}}
								end={{
									label: t('program.stats.total_program_cost'),
									value: formatMoney(stats.totalProgramCostsProgramCurrency, stats.payoutCurrency),
									info: totalProgramCostProgramCurrencyExplanation,
								}}
								percent={stats.payoutProgressPercent}
							/>
							<StatGrid>
								<Stat
									label={t('program.stats.payout_per_interval')}
									value={formatMoney(stats.payoutPerInterval, stats.payoutCurrency)}
									info={payoutPerIntervalExplanation}
								/>
								<Stat label={t('program.stats.interval')} value={stats.payoutInterval} info={payoutIntervalExplanation} />
								<Stat
									label={t('program.stats.program_duration')}
									value={t('program.stats.months', { count: stats.programDurationInMonths })}
									info={programDurationExplanation}
								/>
								<Stat
									label={t('program.stats.projected_remaining')}
									value={formatMoney(projectedRemainingProgramCurrency, stats.payoutCurrency)}
									info={projectedRemainingExplanation}
								/>
								<Stat
									label={t('program.stats.payouts_done')}
									value={formatNumber(stats.payoutsDoneCount)}
									info={payoutsDoneExplanation}
								/>
								<Stat
									label={t('program.stats.remaining_payouts')}
									value={formatNumber(stats.remainingPayoutsCount)}
									info={remainingPayoutsExplanation}
								/>
							</StatGrid>
						</StatPanel>

						<StatPanel href={`/portal/programs/${programId}/payout-forecast`}>
							<StatHeadline
								title={t('program.stats.available_credits')}
								value={t('program.stats.intervals', { count: Math.round(stats.availableCreditsInIntervals * 10) / 10 })}
								info={{ label: t('program.stats.show_intervals_calculation'), content: intervalsExplanation }}
							/>
							<StatGrid>
								<Stat
									label={t('program.stats.available_credits')}
									value={formatMoney(stats.availableCreditsProgramCurrency, stats.payoutCurrency)}
									info={availableCreditsExplanation}
								/>
								<Stat
									label={t('program.stats.cost_per_interval')}
									value={formatMoney(stats.costPerIntervalProgramCurrency, stats.payoutCurrency)}
									info={costPerIntervalProgramExplanation}
								/>
								<Stat
									label={t('program.stats.credit_status')}
									info={creditStatusLabelExplanation}
									value={
										<Tooltip>
											<TooltipTrigger asChild>
												<span className="flex items-center gap-2">
													<Icon className={cn(color, 'h-4 w-4')} aria-hidden />
													<span>{creditStatus}</span>
												</span>
											</TooltipTrigger>
											<TooltipContent sideOffset={8}>{creditExplanation}</TooltipContent>
										</Tooltip>
									}
								/>
								<Stat
									label={t('program.stats.remaining_intervals')}
									value={formatNumber(stats.remainingIntervalsCount)}
									info={remainingIntervalsExplanation}
								/>
							</StatGrid>
						</StatPanel>
					</div>

					<div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
						<StatPanel href={`/portal/programs/${programId}/recipients`}>
							<StatHeadline
								title={t('program.stats.recipient_status')}
								value={t('program.stats.recipients', { count: stats.recipientsCount })}
								info={{ label: t('program.stats.show_recipients_explanation'), content: recipientsTotalExplanation }}
							/>
							<StatGrid>
								<Stat
									label={t('program.stats.future')}
									value={formatNumber(stats.futureRecipientsCount)}
									info={futureRecipientsExplanation}
								/>
								<Stat
									label={t('program.stats.active')}
									value={formatNumber(stats.activeRecipientsCount)}
									info={activeRecipientsExplanation}
								/>
								<Stat
									label={t('program.stats.suspended')}
									value={formatNumber(stats.suspendedRecipientsCount)}
									info={suspendedRecipientsExplanation}
								/>
								<Stat
									label={t('program.stats.completed')}
									value={formatNumber(stats.completedRecipientsCount)}
									info={completedRecipientsExplanation}
								/>
							</StatGrid>
						</StatPanel>

						<StatPanel href={`/portal/programs/${programId}/surveys`}>
							<StatProgress
								title={t('program.stats.survey_progress')}
								start={{
									label: t('program.stats.completed_surveys'),
									value: formatNumber(stats.completedSurveysCount),
									info: completedSurveysExplanation,
								}}
								end={{
									label: t('program.stats.total_surveys'),
									value: formatNumber(stats.totalSurveysCount),
									info: totalSurveysExplanation,
								}}
								percent={stats.surveyCompletionPercent}
							/>
						</StatPanel>
					</div>
				</div>
			</Card>
		</div>
	);
};
